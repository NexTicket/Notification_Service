import { EachMessagePayload } from 'kafkajs';
import { getKafkaConsumer } from '../config/kafka.js';
import { TicketGeneratedEvent, KafkaEventType } from '../types/kafka.types.js';
import { processTicketNotification } from './notificationProcessor.js';
import { ProcessNotificationParams } from '../types/notification.types.js';

class KafkaConsumerService {
    private topics = ['ticket_notifications']; 

    async start(): Promise<void> {
        try {
            const consumer = getKafkaConsumer();

            // Subscribe to the ticket notifications topic
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

            console.log('Kafka Consumer is running and listening for messages...');
        } catch (error) {
            console.error('Failed to start Kafka consumer:', error instanceof Error ? error.message : error);
            console.log('Kafka consumer will retry when topics are available...');
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

            const event: TicketGeneratedEvent = JSON.parse(message.value.toString());
            console.log(`Received event from ${topic}: ${event.eventType}`);

            // Validate event type
            if (event.eventType !== KafkaEventType.TICKET_GENERATED) {
                console.warn(`Unexpected event type: ${event.eventType}. Skipping...`);
                return;
            }

            // Validate required fields
            if (!event.messageId || !event.firebaseUid || !event.qrData) {
                console.error(`Invalid event: missing required fields`, event);
                return;
            }

            // Process the notification
            const params: ProcessNotificationParams = {
                messageId: event.messageId,
                firebaseUid: event.firebaseUid,
                qrData: event.qrData,
                ticketId: event.ticketId,
                orderId: event.orderId,
                eventId: event.eventId,
                venueId: event.venueId,
                timestamp: event.timestamp,
            };

            await processTicketNotification(params);
        } catch (error) {
            console.error(`Error processing message from ${topic} (Offset: ${message.offset}):`, error);
            // Re-throw to let Kafka consumer handle retry logic
            throw error;
        }
    }
}

export const kafkaConsumerService = new KafkaConsumerService();

