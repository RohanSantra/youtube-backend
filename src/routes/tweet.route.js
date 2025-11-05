import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';

const router = express.Router();

router.use(verifyJWT);

router.post("/", createTweet);
router.get("/user/:userId", getUserTweets);
router.patch("/:tweetId", updateTweet);
router.delete("/:tweetId", deleteTweet);

export default router;