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
        console.log('📧 SendGrid sending email:', {
            to: msg.to,
            from: msg.from,
            subject: msg.subject
        });
        
        const [response] = await sgMail.send(msg);
        console.log('✅ SendGrid success:', response.statusCode, response.headers['x-message-id']);
        
        return {
            success: true,
            messageId: response.headers['x-message-id'] || undefined,
            provider: "Sendgrid",
        };
    } catch(error: any) {
        console.error('❌ SendGrid error:', error.message);
        console.error('❌ SendGrid error details:', error.response?.body);
        return {
            success: false,
            error: error.message,
            provider:"Sendgrid",
        };
    }
}


