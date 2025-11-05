import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from '../controllers/subscription.controller.js';


const router=express.Router();

router.use(verifyJWT);

router.get("/c/:channelId",getSubscribedChannels);
router.post("/c/:channelId",toggleSubscription);
router.get("/u/:subscriberId",getUserChannelSubscribers);

export default router;