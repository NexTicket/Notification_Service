import axios from 'axios';
import { EventData } from '../types/notification.types.js';

const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:4000';

/**
 * Retry helper function with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}


export async function getEventAndVenueData(eventId: string): Promise<EventData> {
    return retryWithBackoff(async () => {
        try {
            const url = `${eventServiceUrl}/api/events/${eventId}`;
            console.log(`Fetching event ${eventId} from Event Management Service at ${url}...`);
            console.log(`Making HTTP GET request with 15s timeout...`);
            
            const response = await axios.get(url, {
                timeout: 15000, // Increased to 15 seconds
                headers: { 'Content-Type': 'application/json' },
            });

            console.log(`Received response from Event Management Service (status: ${response.status})`);

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

            const eventData = {
                eventId: data.id.toString(),
                eventName: data.title,
                eventDate: data.startDate,
                venueId: data.venue.id.toString(),
                venueName: data.venue.name,
                venueAddress: data.venue.location || '',
                organizerName: data.Tenant?.name,
            };

            console.log(`Successfully parsed event data: ${eventData.eventName}`);
            return eventData;
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
    }, 3, 1000); // 3 retries with 1 second initial delay
}