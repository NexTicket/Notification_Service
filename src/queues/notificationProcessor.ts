import { notificationQueue } from "./notificationQueue";
import { sendEmail } from "../services/sendGridService";
import { sendTicketPurchaseNotification } from "../services/ticketPurchaseService";
import { sendEventAnnouncement } from "../services/eventAnnouncementService";
import { sendEventReminder } from "../services/eventReminderService";
import { getUserById, getUsersByEventId } from "../services/userService";

notificationQueue.process(async(job) => {
   const {type, ...data} = job.data;

   switch(type)
})