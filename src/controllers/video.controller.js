import asyncHandler from "../utils/asyncHandler.js";
import Video from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find().limit(10).sort({ createdAt: -1 });
    return res
        .status(200)
        .json(
            new ApiResponse(200, videos, "Videos fetched successfully")
        );
});


export const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    if (!title || !description) {
        throw new ApiError(401, "All fields are required");
    }

    const localVideoPath = req.files?.videoFile[0]?.path;
    if (!localVideoPath) {
        throw new ApiError(400, "Video file is required");
    }

    const localThumbnailPath = req.files?.thumbnail[0]?.path;
    if (!localThumbnailPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const uploadedVideo = await uploadOnCloudinary(localVideoPath);
    const uploadedThumbnail = await uploadOnCloudinary(localThumbnailPath);

    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title,
        description,
        isPublished,
        owner: userId,
        duration: uploadedVideo.duration
    })

    return res
        .status(201)
        .json(
            new ApiResponse(201, video, "Videos uploaded successfully")
        );
});

export const getAVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user?._id);


    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$subscribers"
                            },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [userId, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            subscribersCount: 1,
                            isSubscribed: 1,
                            avatar: 1,
                        }
                    }
                ]
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        }
    ]);

    if (!video || video.length === 0) {
        throw new ApiError(404, "Video not found")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
});


export const deleteAVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const videoDeleteResult = await deleteOnCloudinary(video.videoFile);
    if (!videoDeleteResult || (videoDeleteResult.result !== "ok" && videoDeleteResult.result !== "not found")) {
        throw new ApiError(401, "Failed to delete old video from Cloudinary");
    }

    const thumbnailDeleteResult = await deleteOnCloudinary(video.thumbnail);
    if (!thumbnailDeleteResult || (thumbnailDeleteResult.result !== "ok" && thumbnailDeleteResult.result !== "not found")) {
        throw new ApiError(401, "Failed to delete old thumbnail from Cloudinary");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Video delete successfully")
        )

})


export const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const localThumbnailPath = req.file?.path;

    if (!localThumbnailPath) {
        throw new ApiError(401, "Thumbnail file is missing");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(401, "Video not Found");
    }

    const deleteResult = await deleteOnCloudinary(video.thumbnail);
    if (!deleteResult || (deleteResult.result !== "ok" && deleteResult.result !== "not found")) {
        throw new ApiError(401, "Failed to delete old thumbnail from Cloudinary");
    }

    const newThumbnail = await uploadOnCloudinary(localThumbnailPath)
    if (!newThumbnail.url) {
        throw new ApiError(400, "Error while uploading Thumbnail")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: newThumbnail.url
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        )
});


export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, "Video Pulish status changed successfully")
        )
})

