import { sendEmail } from "./sendGridService";
import { ExternalApiService } from "./externalAPIService";
import { EventData } from '../types/index';

const externalApi = new ExternalApiService();

export async function sendEventReminder(eventId:string, daysBefore: number=1) {
    try{
        const eventData = await externalApi.getEventDetails(eventId);

        if(!eventData){
            throw new Error('Event not found');
        }

                //Fetch Attendees
        const attendees = await externalApi.getEventAttendees(eventId);

        const reminderDate = new Date(eventData.date);
        reminderDate.setDate(reminderDate.getDate()-daysBefore);

        const emailContent = `
            <h2>Event Reminder</h2>
            <p>This is a friendly reminder about your upcoming event!</p>
            <h3>${eventData.title}</h3>
            <p>${eventData.description}</p>
            <p><strong>Event Details:</strong></p>
            <ul>
                <li>Date: ${new Date(eventData.date).toLocaleDateString()}</li>
                <li>Venue: ${eventData.venue}</li>
                <li>Time: ${eventData.startTime || 'TBD'}</li>
            </ul>
            <p>Please arrive on time and bring your ticket QR code.</p>
            <p>We look forward to seeing you there!</p>
            <p>Best regards,<br>NexTicket Team</p>
        `;

        const emailPromises = attendees.map((attendee: any) => 
            sendEmail({
                recipient: attendee.email,
                subject: `Reminder: ${eventData.title} - ${daysBefore} day${daysBefore > 1 ? 's' : ''} to go!`,
                content: emailContent
            })
        );

        await Promise.all(emailPromises);
        return { success:true, sentTo:attendees.length };

    }catch(error){
        console.error('Error sending event reminder: ',error);
        return { 
            success: false, 
            error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
        };
    }
    
}