import { Kafka, Consumer, Producer, logLevel } from 'kafkajs';

const kafka = new Kafka({
    clientId: 'notification-service',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    logLevel: process.env.NODE_ENV === 'production' ? logLevel.ERROR : logLevel.INFO,
    retry: {
        initialRetryTime: 300,
        retries: 10,
    },
});

let consumer: Consumer | null = null;
let producer: Producer | null = null;

export const getKafkaConsumer = (): Consumer => {
    if (!consumer) {
        consumer = kafka.consumer({
            groupId: process.env.KAFKA_GROUP_ID || 'notification-service-group',
            sessionTimeout: 30000,
            heartbeatInterval: 3000,
        });
    }
    return consumer;
};

export const getKafkaProducer = (): Producer => {
    if (!producer) {
        producer = kafka.producer({
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
        });
    }
    return producer;
};

export const connectKafka = async (): Promise<void> => {
    try {
        const consumer = getKafkaConsumer();
        await consumer.connect();
        console.log(' Kafka Consumer connected');

        const producer = getKafkaProducer();
        await producer.connect();
        console.log(' Kafka Producer connected');
    } catch (error) {
        console.error('Failed to connect to Kafka:', error);
        throw error;
    }
};

export const disconnectKafka = async (): Promise<void> => {
    try {
        if (consumer) {
            await consumer.disconnect();
            console.log('Kafka Consumer disconnected');
        }
        if (producer) {
            await producer.disconnect();
            console.log('Kafka Producer disconnected');
        }
    } catch (error) {
        console.error('Error disconnecting from Kafka:', error);
    }
};

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectKafka();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await disconnectKafka();
    process.exit(0);
});

export { kafka };
