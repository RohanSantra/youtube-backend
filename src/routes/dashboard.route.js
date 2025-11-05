import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from '../controllers/dashBoard.controller.js';

const router=express.Router();

router.use(verifyJWT);

router.get("/stats",getChannelStats);
router.get("/videos",getChannelVideos);

export default router;