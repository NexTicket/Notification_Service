import { prisma } from '../config/database.js';
import { redisClient } from '../config/redis.js';
import { generateAndUploadQRCode } from './qrCodeService.js';
import { sendTicketNotification } from './sendGridService.js';
import { getUserByFirebaseUid } from '../config/firebase.js';
import { getEventAndVenueData } from './externalAPIService.js';
import { getKafkaProducer } from '../config/kafka.js';
import {
    ProcessNotificationParams,
    NotificationStatus,
    MAX_RETRY_ATTEMPTS,
    DLQ_TOPIC,
    NotificationData,
    UserData,
    EventData,
    SendGridTemplateData,
} from '../types/notification.types.js';

/**
 * Main function to process a ticket notification from Kafka
 * This implements the complete workflow with idempotency and error handling
 */
export async function processTicketNotification(params: ProcessNotificationParams): Promise<void> {
    const { messageId, firebaseUid, qrData, ticketId, orderId, eventId, venueId, timestamp } = params;

    let notificationId: string | null = null;

    try {
        // STEP 1: Check for duplicates (Idempotency)
        const existingNotification = await prisma.notification.findUnique({
            where: { messageId },
        });

        if (existingNotification) {
            console.log(`Duplicate message detected (messageId: ${messageId}). Skipping...`);
            return; // Already processed or in progress
        }

        // STEP 2: Create PENDING record immediately
        const notification = await prisma.notification.create({
            data: {
                messageId,
                firebaseUid,
                recipientEmail: '', // Will be updated after fetching user data
                qrDataString: qrData,
                status: NotificationStatus.PENDING,
                notificationData: {
                    ticketId,
                    orderId,
                    eventId,
                    venueId,
                    timestamp,
                },
            },
        });

        notificationId = notification.id;
        console.log(`Created PENDING notification record: ${notificationId}`);

        // STEP 3: Fetch user data (email) from Firebase Authentication
        const userData: UserData = await getUserByFirebaseUid(firebaseUid);
        const recipientEmail = userData.email;

        console.log(`Fetched user data for ${firebaseUid}: ${recipientEmail}`);

        // Update notification with email
        await prisma.notification.update({
            where: { id: notificationId },
            data: { recipientEmail },
        });

        // STEP 4: Fetch event and venue data (with Redis caching)
    console.log(`STEP 4: Fetching event and venue data for eventId: ${eventId}`);
        const cacheKey = `event:${eventId}:venue:${venueId}`;
        let eventData: EventData;

        // Try Redis cache first
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            eventData = JSON.parse(cachedData);
            console.log(`Event data retrieved from Redis cache: ${eventId}`);
        } else {
            // Cache miss - fetch from Event-Venue Service
            console.log(`Cache miss - fetching from Event Management Service...`);
            eventData = await getEventAndVenueData(eventId);
            
            // Save to Redis (cache for 1 hour)
            await redisClient.set(cacheKey, JSON.stringify(eventData), { EX: 3600 });
            console.log(`Event data fetched and cached: ${eventId}`);
        }

        // Validate that event data was successfully retrieved
        if (!eventData) {
            throw new Error(`Failed to retrieve event data for eventId: ${eventId}, venueId: ${venueId}`);
        }
    console.log(`Event data validated: ${eventData.eventName} at ${eventData.venueName}`);

        // STEP 5: Generate QR code and upload to GCS
    console.log(`STEP 5: Generating QR code for ticket: ${ticketId}`);
    const qrCodeUrl = await generateAndUploadQRCode(qrData);
    console.log(`QR code generated and uploaded: ${qrCodeUrl}`);

        // Update notification with QR code URL
        await prisma.notification.update({
            where: { id: notificationId },
            data: { qrCodeUrl },
        });
    console.log(`Database updated with QR code URL`);

        // STEP 6: Prepare template data and send email via SendGrid
    console.log(`STEP 6: Preparing email template data...`);
        const templateData: SendGridTemplateData = {
            eventName: eventData.eventName,
            venueName: eventData.venueName,
            eventDate: new Date(eventData.eventDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
            qrCodeUrl,
            userName: userData.displayName || 'Valued Customer',
            ticketId,
            orderId,
            venueAddress: eventData.venueAddress || '',
        };

    console.log(`Sending email to ${recipientEmail}...`);
    const sendResult = await sendTicketNotification(recipientEmail, templateData);

        if (sendResult.success) {
            // STEP 7: Update status to SENT
            console.log(`Email sent successfully! Updating database...`);
            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: NotificationStatus.SENT,
                    notificationData: {
                        ...(notification.notificationData as any || {}),
                        ...templateData,
                        sentAt: new Date().toISOString(),
                        sendGridMessageId: sendResult.messageId,
                    } as any,
                },
            });

            console.log(`Notification sent successfully to ${recipientEmail} (ID: ${notificationId})`);
        } else {
            throw new Error(`SendGrid failed: ${sendResult.error}`);
        }
    } catch (error: any) {
        console.error(`Error processing notification (messageId: ${messageId}):`, error.message);

        if (notificationId) {
            // Update notification with failure info
            const currentNotification = await prisma.notification.findUnique({
                where: { id: notificationId },
            });

            const retryCount = (currentNotification?.retryCount || 0) + 1;

            if (retryCount >= MAX_RETRY_ATTEMPTS) {
                // Permanent failure - send to DLQ
                await prisma.notification.update({
                    where: { id: notificationId },
                    data: {
                        status: NotificationStatus.FAILED,
                        failureReason: error.message,
                        retryCount,
                    },
                });

                // Send to Dead Letter Queue
                await sendToDLQ(params, error.message);
                console.log(`Notification FAILED after ${MAX_RETRY_ATTEMPTS} attempts. Sent to DLQ.`);
            } else {
                // Temporary failure - mark for retry
                await prisma.notification.update({
                    where: { id: notificationId },
                    data: {
                        status: NotificationStatus.RETRYING,
                        failureReason: error.message,
                        retryCount,
                    },
                });

                console.log(`Notification marked for retry (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS})`);
                // Re-throw to trigger Kafka consumer retry
                throw error;
            }
        } else {
            // Failed before creating notification record
            await sendToDLQ(params, error.message);
            throw error;
        }
    }
}

/**
 * Send failed message to Dead Letter Queue (DLQ)
 */
async function sendToDLQ(params: ProcessNotificationParams, errorReason: string): Promise<void> {
    try {
        const producer = getKafkaProducer();
        
        await producer.send({
            topic: DLQ_TOPIC,
            messages: [
                {
                    key: params.messageId,
                    value: JSON.stringify({
                        ...params,
                        failureReason: errorReason,
                        failedAt: new Date().toISOString(),
                    }),
                },
            ],
        });

        console.log(`Message sent to DLQ: ${params.messageId}`);
    } catch (error: any) {
        console.error('Failed to send message to DLQ:', error.message);
        // Don't throw - we don't want to fail the entire process because DLQ failed
    }
}
