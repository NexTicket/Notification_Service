import Bull from "bull";
import { CreateNotificationRequest } from "../types/notification.types";
import { redisClient } from "../config/redis";

export const notificationQueue = new Bull<CreateNotificationRequest>(
    "notification-queue",
    process.env.REDIS_URL || "redis://localhost:6379"
);