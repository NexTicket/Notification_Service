import { notificationQueue } from "./notificationQueue";
import { sendEmail } from "../services/sendGridService";
import { sendTicketPurchaseNotification } from "../services/ticketPurchaseService";
import { sendEventAnnouncement } from "../services/eventAnnouncementService";
import { sendEventReminder } from "../services/eventReminderService";
import { getUserById, getUsersByEventId } from "../services/userService";
import { TicketPurchaseData } from "../types";
import { prisma } from "../config/database";

notificationQueue.process(async (job) => {
    const { type, notificationId } = job.data as any;

    try {
        let result: { success: boolean; error?: string };

        switch (type) {
            case 'TICKET_PURCHASE': {
                const ticketPurchaseData: TicketPurchaseData = {
                    orderId: job.data.orderId!,
                    userId: job.data.userId!,
                    eventId: job.data.eventId!,
                    ticketDetails: job.data.ticketDetails!
                };
                result = await sendTicketPurchaseNotification(ticketPurchaseData);
                break;
            }
            case 'EVENT_REMINDER':
                result = await sendEventReminder(job.data.eventId!, job.data.daysBefore!);
                break;
            case 'EVENT_ANNOUNCEMENT':
                result = await sendEventAnnouncement(job.data.eventId!, job.data.customMessage);
                break;
            default:
                throw new Error(`Unknown Notification Type: ${type}`);
        }

        // Update DB status based on result
        if (notificationId) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: {
                    status: result.success ? 'SENT' : 'FAILED',
                    sentAt: result.success ? new Date() : null,
                    metadata: {
                        ...(job.data as any),
                        lastResult: result
                    } as any,
                },
            });
        }

        return result;
    } catch (error) {
        // mark as failed in DB
        if ((job.data as any).notificationId) {
            await prisma.notification.update({
                where: { id: (job.data as any).notificationId },
                data: {
                    status: 'FAILED',
                    metadata: {
                        ...(job.data as any),
                        error: error instanceof Error ? error.message : String(error)
                    } as any,
                }
            });
        }
        throw error;
    }
});
