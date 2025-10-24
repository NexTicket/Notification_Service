import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = {
            status: 'UP',
            timestamp: new Date().toISOString(),
            services: {
                redis: 'DOWN',
                kafka: 'UNKNOWN',
                database: 'UNKNOWN',
            },
        };

        // Check Redis
        try {
            if (redisClient.isOpen) {
                await redisClient.ping();
                health.services.redis = 'UP';
            }
        } catch (error) {
            console.error('Redis health check failed:', error);
        }

        // Determine overall status
        const allUp = Object.values(health.services).every(status => status === 'UP');
        health.status = allUp ? 'UP' : 'DEGRADED';

        const statusCode = health.status === 'UP' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});

router.get('/health/ready', async (req: Request, res: Response) => {
    try {
        // Check if all critical services are ready
        const isRedisReady = redisClient.isOpen;

        if (isRedisReady) {
            res.status(200).json({ status: 'READY' });
        } else {
            res.status(503).json({ status: 'NOT_READY' });
        }
    } catch (error) {
        res.status(503).json({ status: 'NOT_READY', error: 'Readiness check failed' });
    }
});

router.get('/health/live', (req: Request, res: Response) => {
    // Simple liveness check
    res.status(200).json({ status: 'ALIVE' });
});

export default router;
