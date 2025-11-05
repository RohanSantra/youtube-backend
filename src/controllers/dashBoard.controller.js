import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Video from "../models/video.model.js"
import Subscription from "../models/subscription.model.js"
import Like from "../models/like.model.js"

export const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    };

    // 1️⃣ Total videos uploaded by user
    const totalVideosPromise = Video.countDocuments({ owner: userId });

    // 2️⃣ Total subscribers (people who subscribed to this user)
    const totalSubscribersPromise = Subscription.countDocuments({ channel: userId });

    // 3️⃣ Total likes across all user’s videos (slightly optimized)
    // const totalLikesPromise = await Like.aggregate([
    //     {
    //         $lookup: {
    //             from: "videos",
    //             localField: "video",
    //             foreignField: "_id",
    //             as: "videoDetails",
    //         }
    //     },
    //     {
    //         $unwind: "$videoDetails"
    //     },
    //     {
    //         $match: {
    //             "videoDetails.owner": new mongoose.Types.ObjectId(userId)
    //         }
    //     },
    //     {
    //         $count: "totalLikes"
    //     }
    // ]);

    // 3️⃣ Total likes across all user’s videos
    const totalLikesPromise = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $match: {
                            owner: new mongoose.Types.ObjectId(userId)
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $count: "totalLikes"
        }
    ]);

    // 4️⃣ Total views across all user’s videos
    const totalViewsPromise = Video.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) },
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }, // assumes your Video model has a `views` field
            },
        },
    ]);


    // Wait for all in parallel
    const [totalVideos, totalSubscribers, totalLikesResult, totalViewsResult] = await Promise.all([
        totalVideosPromise,
        totalSubscribersPromise,
        totalLikesPromise,
        totalViewsPromise,
    ]);

    const totalLikes = totalLikesResult[0]?.totalLikes || 0;
    const totalViews = totalViewsResult[0]?.totalViews || 0;

    const stats = {
        totalVideos,
        totalSubscribers,
        totalLikes,
        totalViews,
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));

})

export const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    };

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);


    if (videos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No videos found for this channel"));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})