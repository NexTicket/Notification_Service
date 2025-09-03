import sgMail from "../config/sendgrid";
import { SendNotificationParams, SendResult } from "../types/notification.types";

export async function sendEmail(params: SendNotificationParams) : Promise<SendResult> {
    try {
        const msg = {
            to: params.recipient,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: params.subject || 'Notification',
            text: params.textContent || params.content,
            html: params.content,
        };
        const [response] = await sgMail.send(msg);
        return {
            success: true,
            messageId: response.headers['x-message-id'] || undefined,
            provider: "Sendgrid",
        };
    } catch(error: any) {
        return {
            success: false,
            error: error.message,
            provider:"Sendgrid",
        };
    }
}


