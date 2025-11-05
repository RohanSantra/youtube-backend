import express from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteAVideo,
    getAllVideos,
    getAVideo,
    publishAVideo,
    updateVideo,
    togglePublishStatus
} from '../controllers/video.controller.js';
import { upload } from '../middlewares/multer.middleware.js';


const router = express.Router();

router.use(verifyJWT)
router.get("/", getAllVideos);
router.post("/", upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    }, {
        name: "thumbnail",
        maxCount: 1
    }
]), publishAVideo);

router.get("/:videoId", getAVideo);
router.delete("/:videoId", deleteAVideo);
router.patch("/:videoId", updateVideo);

router.patch("/toggle/publish/:videoId", togglePublishStatus);

export default router;