import axios from 'axios';
import { cacheService } from '../config/redis';
import { EventData, OrderData, TicketData, UserData } from '../types/index';

export class ExternalApiService {
    private evmsBaseUrl: string;
    private userServiceBaseUrl: string;
    private orderServiceBaseUrl: string;

    constructor() {
        this.evmsBaseUrl = process.env.EVMS_API_URL || 'http://localhost:8000';
        this.userServiceBaseUrl = process.env.USER_SERVICE_API_URL || 'http://localhost:4001';
        this.orderServiceBaseUrl = process.env.ORDER_SERVICE_API_URL || 'http://localhost:4003';
    }

    async getEventDetails(eventId: string): Promise<EventData | null> {
        const cacheKey = `event: ${eventId}`;

        //Try to retrieve from cache first
        let eventData = await cacheService.get(cacheKey);
        if (eventData) {
            console.log(`Event ${eventId} found in cache`);
            return eventData as EventData;
        }

        try {
            console.log(`Fetching event ${eventId} for Event and Venue Service`);
            const response = await axios.get(`${this.evmsBaseUrl}/api/events/${eventId}`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        eventData= response.data;

        //cache for 2 hours
        await cacheService.set(cacheKey, eventData, 7200);
        console.log(`Event ${eventId} cached`)
        return eventData;
        } catch (error) {
            console.error(`Error fetching event ${eventId}:`, error);
            return null;
        }
    }

    async getOrderDetails(orderId: string): Promise<OrderData | null> {
        const cacheKey = `order: ${orderId}`;

        //Try to retrieve from cache first
        let orderData = await cacheService.get(cacheKey);
        if (orderData) {
            console.log(`Order ${orderId} found in cache`);
            return orderData as OrderData;
        }

        try {
            console.log(`Fetching event ${orderId} for Event and Venue Service`);
            const response = await axios.get(`${this.orderServiceBaseUrl}/api/events/${orderId}`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        orderData= response.data;

        //cache for 2 hours
        await cacheService.set(cacheKey, orderData, 7200);
        console.log(`Order ${orderId} cached`)
        return orderData;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            return null;
        }
    }

    async getTicketDetails(ticketId: string): Promise<TicketData | null> {
        const cacheKey = `ticket: ${ticketId}`;

        //Try to retrieve from cache first
        let ticketData = await cacheService.get(cacheKey);
        if (ticketData) {
            console.log(`Ticket ${ticketId} found in cache`);
            return ticketData as TicketData;
        }

        try {
            console.log(`Fetching ticket ${ticketId} for Event and Venue Service`);
            const response = await axios.get(`${this.evmsBaseUrl}/api/tickets/${ticketId}`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            ticketData = response.data;

            //cache for 2 hours
            await cacheService.set(cacheKey, ticketData, 7200);
            console.log(`Ticket ${ticketId} cached`)
            return ticketData;
        } catch (error) {
            console.error(`Error fetching ticket ${ticketId}:`, error);
            return null;
        }
    }

    async getEventAttendees(eventId: string): Promise<UserData[]> {
        // TODO: This should fetch actual attendees from the order/ticket service
        // For now, return empty array - this needs to be implemented when order service is available
        console.log(`Fetching attendees for event ${eventId} - placeholder implementation`);
        return [];
    }
};