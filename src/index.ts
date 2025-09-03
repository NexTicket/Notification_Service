import express from 'express';
import dotenv from 'dotenv';
import notificationRoutes from "./routes/notification.routes";
import { connectRedis } from './config/redis';
import "./queues/notificationProcessor";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", notificationRoutes );

console.log("Starting Notification Service...");

connectRedis()
    .then(() => {
        console.log("Connected to Redis. Starting Express server...");
        app.listen(PORT,() => {
            console.log(`Server running in port ${PORT}`);
        } )
    })
    .catch((err)=>{
        console.error("Redis Connection failed: ", err);
    })

// Global error handlers for debugging
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});