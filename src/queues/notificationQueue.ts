import Bull from "bull";
import { CreateNotificationRequest } from "../types/notification.types";

// Payload used inside our Bull queue, with DB notification id
export type NotificationJobPayload = CreateNotificationRequest & { notificationId: string };

export const notificationQueue = new Bull<NotificationJobPayload>(
    "notification-queue",
    process.env.REDIS_URL || "redis://localhost:6379"
);
