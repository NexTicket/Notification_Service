import express from 'express';
import dotenv from 'dotenv';
import notificationRoutes from "./routes/notification.routes";
import healthRoutes from "./routes/health.routes";
import { connectRedis } from './config/redis';
import { connectDatabase } from './config/database';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import "./queues/notificationProcessor";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use("/api", notificationRoutes );
app.use("/api", healthRoutes);

console.log("Starting Notification Service...");

connectDatabase()
    .then(() => connectRedis())
    .then(() => {
        console.log("Connected to databases. Starting Express server...");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err: any) => {
        console.error("Database or Redis Connection failed: ", err);
        process.exit(1);
    });

// Global error handlers 
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

// Centralized error handler 
app.use(errorHandler);
