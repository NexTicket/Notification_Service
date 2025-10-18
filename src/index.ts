import dotenv from 'dotenv';

// IMPORTANT: Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import notificationRoutes from "./routes/notification.routes";
import healthRoutes from "./routes/health.routes";
import { connectRedis } from './config/redis';
import { connectKafka } from './config/kafka';
import { kafkaConsumerService } from './services/kafkaConsumer';
import "./queues/notificationProcessor";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(express.json());
app.use("/api", notificationRoutes);
app.use("/api", healthRoutes);

console.log("Starting Notification Service...");

// Initialize all services
async function startServices() {
    try {
        // Connect to Redis
        await connectRedis();
        console.log(" Connected to Redis");

        // Connect to Kafka
        try {
            await connectKafka();
            console.log(" Connected to Kafka");

            // Start Kafka consumer
            await kafkaConsumerService.start();
            console.log(" Kafka consumer started");
        } catch (kafkaError) {
            console.warn(" Kafka connection failed - service will continue without Kafka");
            console.warn(" Error:", kafkaError instanceof Error ? kafkaError.message : kafkaError);
        }

        // Start Express server
        app.listen(PORT, () => {
            console.log(` Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Service initialization failed:", err);
        process.exit(1);
    }
}

startServices();

// Global error handlers for debugging
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});