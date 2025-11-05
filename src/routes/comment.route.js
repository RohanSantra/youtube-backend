import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from '../controllers/comment.controller.js';

const router=express.Router();

router.use(verifyJWT);

router.post("/:videoId",addComment);
router.get("/:videoId",getVideoComments);

router.patch("/c/:commentId",updateComment);
router.delete("/c/:commentId",deleteComment);

export default router;