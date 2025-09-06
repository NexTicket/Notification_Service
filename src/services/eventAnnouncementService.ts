import { sendEmail } from "./sendGridService";
import { ExternalApiService } from "./externalAPIService";
import { EventData } from '../types/index';

const externalApi = new ExternalApiService();

export async function sendEventAnnouncement(eventId:string, customMessage?:string){
    try{
        const eventData = await externalApi.getEventDetails(eventId);

        if(!eventData){
            throw new Error ('Event Data not found');
        }
        //Fetch attendees (you'll need to implement this in ExternalApiService)
        const attendees = await externalApi.getEventAttendees(eventId);

        const emailContent = `
            <h2>New Event Announcement</h2>
            <p>We're excited to announce a new event!</p>
            <h3>${eventData.title}</h3>
            <p>${eventData.description}</p>
            <p><strong>Event Details:</strong></p>
            <ul>
                <li>Date: ${new Date(eventData.date).toLocaleDateString()}</li>
                <li>Venue: ${eventData.venue}</li>
                <li>Organizer: ${eventData.organizer}</li>
            </ul>
            ${customMessage ? `<p>${customMessage}</p>` : ''}
            <p>Don't miss out! Get your tickets now.</p>
            <p>Best regards,<br>NexTicket Team</p>
        `;

        const emailPromises = attendees.map(attendee => 
            sendEmail({
                recipient: attendee.email,
                subject: `Announcement on : ${eventData.title}`,
                content: emailContent
            })
        );
        await Promise.all(emailPromises);
        return { success: true, sentTo: attendees.length};

    }catch(error){
        console.error('Error sending event announcement:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}