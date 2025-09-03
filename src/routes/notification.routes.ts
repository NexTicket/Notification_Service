import { Router } from "express";
import { enqueueNotification } from "../controllers/notification.controller";

const router = Router();
router.post("/notify", enqueueNotification);

export default router;