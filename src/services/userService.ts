import axios from 'axios';
import { cacheService } from '../config/redis';
import { UserData } from '../types/index';

export class UserService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.USER_SERVICE_API_URL || 'http://localhost:4001';
    }

    async getUserById(userId: string): Promise<UserData | null>{
        const cacheKey = `user:${userId}`;
        let user = await cacheService.get(cacheKey);
        if (user) return user as UserData;

        try {
            const response = await axios.get(`${this.baseUrl}/api/users/${userId}`);
            user = response.data;
            await cacheService.set(cacheKey,user,3600);
            return user;
        }catch(error){
            console.error('Error fetching user:', error);
            return null;
        }
    }

    async getUsersByEventId(eventId:string): Promise<UserData[]>{
        // This would need to be implemented in your order/ticket service
        // For now, return mock data
        return [];
    }
}

export const userService = new UserService();

export const getUserById = (userId: string) => userService.getUserById(userId);
export const getUsersByEventId = (eventId: string) => userService.getUsersByEventId(eventId);
