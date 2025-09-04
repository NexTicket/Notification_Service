import sgMail from "../config/sendgrid";
import { SendNotificationParams, SendResult } from "../types/notification.types";

export async function sendEmail(params: SendNotificationParams) : Promise<SendResult> {
    try {
        const msg: {
            to: string;
            from: string;
            subject: string;
            text: string;
            html: string;
            attachments?: Array<{
                content: string;
                filename: string;
                type: string;
                disposition: string;
            }>;
        } = {
            to: params.recipient,
            from: process.env.SENDGRID_FROM_EMAIL!,
            subject: params.subject || 'Notification',
            text: params.textContent || params.content,
            html: params.content,
        };

        //Add attachments if provided
        if(params.attachments){
            msg.attachments = params.attachments.map(attachment => ({
                content: attachment.content,
                filename: attachment.filename,
                type: attachment.type,
                disposition: 'attachment'
            }));
        }
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


