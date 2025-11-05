import asyncHander from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const generateAccessAndRefereshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const signUp = asyncHander(async (req, res) => {
    const { username, email, fullName, password } = req.body;


    if (!username || !email || !fullName || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must include 6 or more characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    const existingUser = await User.findOne({
        $or: [
            {
                email: email
            },
            {
                username: username
            }
        ]
    })

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists ")
    }

    // console.log(req);

    // console.log("Request files : \n", req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files?.coverImage[0]?.path
    }

    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
    const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: uploadedAvatar?.url,
        coverImage: uploadedCoverImage?.url || ""
    });

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id);


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }


    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser
                },
                "User signed up suucessfully")
        )

})



export const login = asyncHander(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email) || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
        throw new ApiError(400, "Password must include 6 or more characters");
    }

    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshToken(user._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                201,
                {
                    user: user, accessToken
                },
                "User Logined in suucessfully")
        )


})


export const logout = asyncHander(async (req, res) => {
    await User.findByIdAndUpdate(
        {
            _id: req.user?._id
        },
        {
            $unset: {
                refreshToken: 1     // this removes the field from document
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged Out"))

})


export const refreshAccessToken = asyncHander(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET,
    )

    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")

    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshToken(user._id)

    res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access Token refreshed"
            )
        )
});



export const changePassword = asyncHander(async (req, res) => {
    const { originalPassword, updatedPassword, confirmUpdatedPassword } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordValid = await user.isPasswordCorrect(originalPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect old password");
    }

    if (updatedPassword !== confirmUpdatedPassword) {
        throw new ApiError(401, "update and confirm Password do not match");
    }

    user.password = updatedPassword;
    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

});


export const getCurrentUser = asyncHander((req, res) => {
    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User fetched successfully"
            )
        )
});


export const updateAccountDetails = asyncHander(async (req, res) => {
    const { username, fullName } = req.body;

    if (!fullName || !username) {
        throw new ApiError(401, "Fields cannot be empty");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName: fullName,
                username: username
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
});


export const updateAvatarImage = asyncHander(async (req, res) => {
    const localAvatarImagePath = req.file.path;
    if (!localAvatarImagePath) {
        throw new ApiError(401, "Avatar file is missing")
    }

    const deleteResult = await deleteOnCloudinary(req.user?.avatar);
    if (!deleteResult || (deleteResult.result !== "ok" && deleteResult.result !== "not found")) {
        throw new ApiError(401, "Failed to delete old avatar from Cloudinary");
    }

    const newAvatar = await uploadOnCloudinary(localAvatarImagePath)
    if (!newAvatar.url) {
        throw new ApiError(400, "Error while uploading avatar")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: newAvatar.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Avatar image updated successfully")
        )
})

export const updateCoverImage = asyncHander(async (req, res) => {
    const localCoverImagePath = req.file.path;
    if (!localCoverImagePath) {
        throw new ApiError(401, "Cover Image is missing")
    }

    const originalCoverImage = req.user.coverImage
    if (originalCoverImage) {
        const isCoverImageDeleted = await deleteOnCloudinary(originalCoverImage);
        if (!isCoverImageDeleted) {
            throw new ApiError(401, "Failed to delete Cover Image file on cloudinary")
        }
    }


    const newCoverImage = await uploadOnCloudinary(localCoverImagePath)
    if (!newCoverImage.url) {
        throw new ApiError(400, "Error while uploading cover image")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: newCoverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Cover image updated successfully")
        )
});

export const getUserChannelProfile = asyncHander(async (req, res) => {
    const { username } = req.params;

    if (!username) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
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
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }
    ]);

    if (!channel?.length) {
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "No channel exist for that user")
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User channel fetched successfully")
        )
});


export const getWatchHistory = asyncHander(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const user = await User.aggregate([
        {
            $match: {
                _id: userId
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
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
                            owner: "$owner"
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
});