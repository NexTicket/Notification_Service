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
            allowAutoTopicCreation: false,
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

export const createTopicIfNotExists = async (topicName: string): Promise<void> => {
    const admin = kafka.admin();
    try {
        await admin.connect();
        console.log('Kafka Admin connected');

        // Check if topic exists
        const topics = await admin.listTopics();
        
        if (topics.includes(topicName)) {
            console.log(`Topic '${topicName}' already exists`);
            return;
        }

        // Create topic with 1 partition and replication factor 1
        await admin.createTopics({
            topics: [
                {
                    topic: topicName,
                    numPartitions: 1,
                    replicationFactor: 1,
                },
            ],
        });

        console.log(`✓ Created Kafka topic: '${topicName}' (partitions: 1, replication-factor: 1)`);
    } catch (error) {
        console.error(`Error creating topic '${topicName}':`, error);
        throw error;
    } finally {
        await admin.disconnect();
        console.log('Kafka Admin disconnected');
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
