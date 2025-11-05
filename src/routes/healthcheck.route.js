import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { healthcheck } from '../controllers/healtCheck.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.get("/", healthcheck);

export default router;