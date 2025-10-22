import axios from 'axios';
import { EventData } from '../types/notification.types.js';

const eventServiceUrl = process.env.EVENT_SERVICE_API_URL || 'http://localhost:4000';

/**
 * Fetch event and venue data from Event-Venue Service
 * @param eventId - The event ID
 * @param venueId - The venue ID
 * @returns Combined event and venue data
 */
export async function getEventAndVenueData(eventId: string, venueId: string): Promise<EventData> {
    try {
        console.log(`Fetching event ${eventId} and venue ${venueId} from Event-Venue Service...`);
        
        // Fetch event and venue data in parallel
        const [eventResponse, venueResponse] = await Promise.all([
            axios.get(`${eventServiceUrl}/api/events/${eventId}`, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' },
            }),
            axios.get(`${eventServiceUrl}/api/venues/${venueId}`, {
                timeout: 5000,
                headers: { 'Content-Type': 'application/json' },
            }),
        ]);

        const eventData = eventResponse.data as any;
        const venueData = venueResponse.data as any;

        return {
            eventId,
            eventName: eventData.name || eventData.title,
            eventDate: eventData.date || eventData.startDate,
            venueId,
            venueName: venueData.name,
            venueAddress: venueData.address || venueData.location,
            organizerName: eventData.organizerName || eventData.organizer,
        };
    } catch (error: any) {
        console.error(`Error fetching event/venue data:`, error.message);
        throw new Error(`Failed to fetch event/venue data: ${error.message}`);
    }
}