import { PrismaClient } from '@prisma/client';
import { Request, Response } from "express";
import { notificationQueue } from "../queues/notificationQueue";
import { CreateNotificationRequest } from "../types/notification.types";

export async function enqueueNotification(req: Request, res: Response) {
  const notification: CreateNotificationRequest = req.body;
  await notificationQueue.add(notification);
  res.status(200).json({ message: "Notification queued." });
}

