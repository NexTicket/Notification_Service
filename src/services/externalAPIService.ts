import axios from 'axios';
import { EventData } from '../types/notification.types.js';

const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:4000';


export async function getEventAndVenueData(eventId: string): Promise<EventData> {
    try {
        console.log(`Fetching event ${eventId} from Event Management Service...`);
        
        const response = await axios.get(`${eventServiceUrl}/events/${eventId}`, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' },
        });

        const responseData = response.data as any;

        if (responseData.error) {
            throw new Error(responseData.error);
        }

        if (!responseData.data) {
            throw new Error('Invalid response format: missing data field');
        }

        const { data } = responseData;

        if (!data.venue) {
            throw new Error(`Event ${eventId} does not have venue information`);
        }

        if (!data.id || !data.title || !data.startDate) {
            throw new Error('Invalid event data: missing required fields');
        }

        return {
            eventId: data.id.toString(),
            eventName: data.title,
            eventDate: data.startDate,
            venueId: data.venue.id.toString(),
            venueName: data.venue.name,
            venueAddress: data.venue.location || '',
            organizerName: data.Tenant?.name,
        };
    } catch (error: any) {
        // Handle Axios-specific errors
        if (error.response) {
            // Server responded with error status
            const errorData = error.response.data as any;
            const errorMessage = errorData?.error || `HTTP ${error.response.status} error`;
            console.error(`Event API error (${error.response.status}):`, errorMessage);
            throw new Error(`Failed to fetch event data: ${errorMessage}`);
        } else if (error.request) {
            // Request made but no response received
            console.error('Event API timeout or no response:', error.message);
            throw new Error('Event Management Service is unreachable');
        }

        // Handle other errors
        console.error(`Error fetching event/venue data:`, error.message);
        throw new Error(`Failed to fetch event/venue data: ${error.message}`);
    }
}