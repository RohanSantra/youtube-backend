import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Like from "../models/like.model.js";

export const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;


    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    let message = '';
    let liked = null;

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Removed like successfully from video";
    } else {
        liked = await Like.create({
            video: videoId,
            likedBy: userId,
        });
        message = "Like added successfully to video";
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, liked, message)
        );


})

export const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;


    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    let message = '';
    let liked = null;

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Removed like successfully from comment";
    } else {
        liked = await Like.create({
            comment: commentId,
            likedBy: userId,
        });
        message = "Like added successfully to comment";
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, liked, message)
        );


})

export const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;


    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    let message = '';
    let liked = null;

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        message = "Removed like successfully from tweet";
    } else {
        liked = await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });
        message = "Like added successfully to tweet";
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, liked, message)
        );

})

export const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null } // ✅ only video likes
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideos" // optional, flattens the array
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                video: 1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos.map(v => v.video), "Liked videos fetched successfully")
        );

});
