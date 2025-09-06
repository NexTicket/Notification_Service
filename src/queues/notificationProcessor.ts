import { notificationQueue } from "./notificationQueue";
import { sendEmail } from "../services/sendGridService";
import { sendTicketPurchaseNotification } from "../services/ticketPurchaseService";
import { sendEventAnnouncement } from "../services/eventAnnouncementService";
import { sendEventReminder } from "../services/eventReminderService";
import { getUserById, getUsersByEventId } from "../services/userService";
import { TicketPurchaseData } from "../types";

notificationQueue.process(async (job) => {
    const { type } = job.data;

    switch (type) {
        case 'TICKET_PURCHASE':
            const ticketPurchaseData: TicketPurchaseData = {
                orderId: job.data.orderId!,
                userId: job.data.userId!,
                eventId: job.data.eventId!,
                ticketDetails: job.data.ticketDetails!
            };
            return await sendTicketPurchaseNotification(ticketPurchaseData);
        case 'EVENT_REMINDER':
            return await sendEventReminder(job.data.eventId!, job.data.daysBefore!);
        case 'EVENT_ANNOUNCEMENT':
            return await sendEventAnnouncement(job.data.eventId!, job.data.customMessage);
        default:
            throw new Error(`Unknown Notification Type: ${type}`);
    }
});