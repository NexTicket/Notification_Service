import { Router } from "express";
import { redisClient } from "../config/redis";

const router = Router();

router.get("/health",   async (req,res) => {
    try {
        const redisStatus = redisClient.isOpen ? "connected" : "disconnected";

        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            services: {
                redis: redisStatus
            }
        });
    }catch (error) {
        res.status(500).json({
            status: "unhealthy",
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

export default router;