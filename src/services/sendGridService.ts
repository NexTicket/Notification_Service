import sgMail from '../config/sendgrid.js';
import { SendGridTemplateData } from '../types/notification.types.js';

export interface SendEmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send email using SendGrid Dynamic Template
 * @param recipientEmail - The user's email address
 * @param templateData - The dynamic data for the template
 * @returns SendEmailResult with success status
 */
export async function sendTicketNotification(
    recipientEmail: string,
    templateData: SendGridTemplateData
): Promise<SendEmailResult> {
    try {
        const templateId = process.env.SENDGRID_TEMPLATE_ID;
        
        if (!templateId) {
            throw new Error('SENDGRID_TEMPLATE_ID is not configured');
        }

        const msg = {
            to: recipientEmail,
            from: process.env.SENDGRID_FROM_EMAIL!,
            templateId: templateId, // Use dynamic template ID
            dynamicTemplateData: templateData, // Pass template data
        };

        const [response] = await sgMail.send(msg);
        
        console.log(`Email sent to ${recipientEmail} via SendGrid template ${templateId}`);
        
        return {
            success: true,
            messageId: response.headers['x-message-id'] || undefined,
        };
    } catch (error: any) {
        console.error('SendGrid error:', error.response?.body || error.message);
        return {
            success: false,
            error: error.response?.body?.errors?.[0]?.message || error.message,
        };
    }
}



