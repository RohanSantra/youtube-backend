import express from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
    changePassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    login,
    logout,
    refreshAccessToken,
    signUp,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), signUp);
router.post("/login", login);

//secured routes
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", verifyJWT, refreshAccessToken);
router.post("/change-password", verifyJWT, changePassword);
router.post("/update-account-details", verifyJWT, updateAccountDetails);
router.get("/me", verifyJWT, getCurrentUser);

router.post("/update-avatar-image", verifyJWT, upload.single("avatar"), updateAvatarImage);
router.post("/update-cover-image", verifyJWT, upload.single("coverImage"), updateCoverImage);

router.get("/c/:username", verifyJWT, getUserChannelProfile);
router.get("/watchHistory", verifyJWT, getWatchHistory);


export default router;