import { Request, Response } from "express";
import { notificationQueue } from "../queues/notificationQueue";
import { CreateNotificationRequest } from "../types/notification.types";
import { prisma } from "../config/database";
import { NotificationStatus, NotificationType } from "../types/notification.types";

export async function enqueueNotification(req: Request, res: Response) {
  const notification: CreateNotificationRequest = req.body;
  // Persist a Notification record with PENDING status
  const userIdentifier = notification.recipient || notification.userId || "unknown";
  const subject = notification.subject ?? null;
  const body = notification.content ?? "";

  try {
    const created = await prisma.notification.create({
      data: {
        type: 'EMAIL', // channel type from Prisma enum
        userId: userIdentifier,
        subject: subject ?? undefined,
        body,
        status: 'PENDING',
        metadata: notification as any,
      },
    });

    await notificationQueue.add({ ...notification, notificationId: created.id });
    res.status(200).json({ message: "Notification queued.", id: created.id });
  } catch (err) {
    console.error('Failed to enqueue notification:', err);
    res.status(500).json({ error: 'Failed to enqueue notification' });
  }
}
