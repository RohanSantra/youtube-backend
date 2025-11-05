import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Subscription from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";


export const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;

    if (userId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });

    let message = '';
    let subscription = null;

    if (existingSubscription) {
        // Unsubscribing if already subscribed
        await Subscription.findByIdAndDelete(existingSubscription._id,);
        message = "Unsubscribed successfully";
    } else {
        // Subscribing
        subscription = await Subscription.create({
            subscriber: userId,
            channel: channelId,
        });
        message = "Subscribed successfully";
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscription, message)
        );


})

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $replaceRoot: {
                newRoot: "$subscriberDetails"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched Successfully")
        )

})

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedToDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscribedToDetails"
        },
        {
            $replaceRoot: {
                newRoot: "$subscribedToDetails"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribedChannels, "Subscribed channels fetched Successfully")
        )
});

