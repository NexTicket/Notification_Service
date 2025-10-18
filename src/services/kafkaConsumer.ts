import { EachMessagePayload } from 'kafkajs';
import { getKafkaConsumer } from '../config/kafka';
import { KafkaEvent, KafkaEventType } from '../types/kafka.types';
import { notificationQueue } from '../queues/notificationQueue';
import { CreateNotificationRequest, NotificationType } from '../types/notification.types';

class KafkaConsumerService {
    private topics = [
        'order-events',
        'payment-events',
        'ticket-events',
        'user-events',
        'order-notifications',
    ];

    async start(): Promise<void> {
        try {
            const consumer = getKafkaConsumer();

            // Subscribe to all notification topics
            for (const topic of this.topics) {
                try {
                    await consumer.subscribe({ topic, fromBeginning: false });
                    console.log(`Subscribed to Kafka topic: ${topic}`);
                } catch (error) {
                    console.warn(`Could not subscribe to topic ${topic}:`, error instanceof Error ? error.message : error);
                }
            }

            // Start consuming messages
            await consumer.run({
                eachMessage: async (payload: EachMessagePayload) => {
                    await this.handleMessage(payload);
                },
            });

            console.log(' Kafka Consumer is running and listening for messages...');
        } catch (error) {
            console.error('Failed to start Kafka consumer:', error instanceof Error ? error.message : error);
            console.log(' Kafka consumer will retry when topics are available...');
            // Don't throw - allow the service to continue without Kafka
        }
    }

    private async handleMessage(payload: EachMessagePayload): Promise<void> {
        const { topic, partition, message } = payload;

        try {
            if (!message.value) {
                console.warn('Received empty message, skipping...');
                return;
            }

            const eventData: KafkaEvent = JSON.parse(message.value.toString());
            console.log(` Received event from ${topic}:`, eventData.eventType);

            // Route to appropriate handler based on event type
            await this.routeEvent(eventData);
        } catch (error) {
            console.error(`Error processing message from ${topic} (Offset: ${message.offset}):`, error);
            throw error;
        }
    }

    private async routeEvent(event: KafkaEvent): Promise<void> {
        switch (event.eventType) {
            case KafkaEventType.ORDER_CONFIRMED:
                await this.handleOrderConfirmed(event);
                break;
            case KafkaEventType.ORDER_CANCELLED:
                await this.handleOrderCancelled(event);
                break;
            case KafkaEventType.PAYMENT_SUCCESSFUL:
                await this.handlePaymentSuccessful(event);
                break;
            case KafkaEventType.PAYMENT_FAILED:
                await this.handlePaymentFailed(event);
                break;
            case KafkaEventType.TICKET_GENERATED:
                await this.handleTicketGenerated(event);
                break;
            case KafkaEventType.USER_REGISTERED:
                await this.handleUserRegistered(event);
                break;
            case KafkaEventType.EVENT_REMINDER:
                await this.handleEventReminder(event);
                break;
            case KafkaEventType.EVENT_CANCELLED:
                await this.handleEventCancelled(event);
                break;
            default:
                console.log('Unhandled event type:', event);
        }
    }

    private async handleOrderConfirmed(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: `Order Confirmation - ${event.eventTitle}`,
            content: `
                <h2>Your order has been confirmed!</h2>
                <p>Order ID: ${event.orderId}</p>
                <p>Event: ${event.eventTitle}</p>
                <p>Date: ${new Date(event.eventDate).toLocaleDateString()}</p>
                <p>Venue: ${event.venue}</p>
                <p>Total Amount: $${event.totalAmount}</p>
            `,
            variables: {
                orderId: event.orderId,
                eventTitle: event.eventTitle,
                eventDate: event.eventDate,
                venue: event.venue,
                totalAmount: event.totalAmount,
            },
        };

        await notificationQueue.add(notification);
        console.log(` Order confirmation notification queued for user: ${event.userId}`);
    }

    private async handleOrderCancelled(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: 'Order Cancellation Confirmation',
            content: `
                <h2>Your order has been cancelled</h2>
                <p>Order ID: ${event.orderId}</p>
                <p>Refund Amount: $${event.refundAmount}</p>
                <p>Reason: ${event.reason}</p>
            `,
            variables: event,
        };

        await notificationQueue.add(notification);
        console.log(` Order cancellation notification queued for user: ${event.userId}`);
    }

    private async handlePaymentSuccessful(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: 'Payment Successful',
            content: `
                <h2>Payment Confirmed</h2>
                <p>Payment ID: ${event.paymentId}</p>
                <p>Amount: $${event.amount}</p>
                <p>Payment Method: ${event.paymentMethod}</p>
            `,
            variables: event,
        };

        await notificationQueue.add(notification);
        console.log(` Payment success notification queued for user: ${event.userId}`);
    }

    private async handlePaymentFailed(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: 'Payment Failed',
            content: `
                <h2>Payment Failed</h2>
                <p>Payment ID: ${event.paymentId}</p>
                <p>Amount: $${event.amount}</p>
                <p>Reason: ${event.reason}</p>
                <p>Please try again or contact support.</p>
            `,
            variables: event,
        };

        await notificationQueue.add(notification);
        console.log(` Payment failed notification queued for user: ${event.userId}`);
    }

    private async handleTicketGenerated(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: `Your Ticket for ${event.eventTitle}`,
            content: `
                <h2>Your Ticket is Ready!</h2>
                <p>Event: ${event.eventTitle}</p>
                <p>Date: ${new Date(event.eventDate).toLocaleDateString()}</p>
                <p>Venue: ${event.venue}</p>
                ${event.seatNumber ? `<p>Seat: ${event.seatNumber}</p>` : ''}
                <p>Ticket ID: ${event.ticketId}</p>
                <img src="data:image/png;base64,${event.qrCode}" alt="QR Code" />
            `,
            variables: event,
        };

        await notificationQueue.add(notification);
        console.log(` Ticket notification queued for user: ${event.userId}`);
    }

    private async handleUserRegistered(event: any): Promise<void> {
        const notification: CreateNotificationRequest = {
            type: NotificationType.EMAIL,
            recipient: event.userId,
            subject: 'Welcome to NexTicket!',
            content: `
                <h2>Welcome ${event.displayName}!</h2>
                <p>Thank you for registering with NexTicket.</p>
                <p>Start exploring amazing events and book your tickets today!</p>
            `,
            variables: event,
        };

        await notificationQueue.add(notification);
        console.log(` Welcome notification queued for user: ${event.userId}`);
    }

    private async handleEventReminder(event: any): Promise<void> {
        // Send reminder to multiple users
        for (const userId of event.userIds) {
            const notification: CreateNotificationRequest = {
                type: NotificationType.EMAIL,
                recipient: userId,
                subject: `Reminder: ${event.eventTitle} is coming up!`,
                content: `
                    <h2>Event Reminder</h2>
                    <p>Don't forget! ${event.eventTitle} is happening soon.</p>
                    <p>Date: ${new Date(event.eventDate).toLocaleDateString()}</p>
                    <p>Venue: ${event.venue}</p>
                `,
                variables: event,
            };

            await notificationQueue.add(notification);
        }
        console.log(` Event reminder notifications queued for ${event.userIds.length} users`);
    }

    private async handleEventCancelled(event: any): Promise<void> {
        // Notify all affected users
        for (const userId of event.affectedUserIds) {
            const notification: CreateNotificationRequest = {
                type: NotificationType.EMAIL,
                recipient: userId,
                subject: `Event Cancelled: ${event.eventTitle}`,
                content: `
                    <h2>Event Cancellation Notice</h2>
                    <p>Unfortunately, ${event.eventTitle} has been cancelled.</p>
                    <p>Reason: ${event.reason}</p>
                    <p>Refund Amount: $${event.refundInfo.refundAmount}</p>
                    <p>Refund Method: ${event.refundInfo.refundMethod}</p>
                    <p>We apologize for any inconvenience.</p>
                `,
                variables: event,
            };

            await notificationQueue.add(notification);
        }
        console.log(` Event cancellation notifications queued for ${event.affectedUserIds.length} users`);
    }
}

export const kafkaConsumerService = new KafkaConsumerService();
