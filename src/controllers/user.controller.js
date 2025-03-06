import asyncHandler from "../utils/asyncHandler.js";
import APIError from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import uploadFile from "../utils/fileUpload.js";
import APIResponse from "../utils/APIResponse.js";
import { REFRESH_TOKEN_SECRET } from "../config.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: true,
};

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();

    user.refreshToken = refreshToken;
    //? To counter required fields
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(500, "Something went wrong while tokens generation");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new APIError(400, "All fields are required");
  }

  const exitedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exitedUser) {
    throw new APIError(409, "User already exists");
  }

  const avatarPath = req?.files?.avatar[0].path;
  let coverImagePath;
  if (req?.files?.coverImage) coverImagePath = req?.files?.coverImage[0].path;
  console.log("File Path: ", avatarPath, coverImagePath);

  if (!avatarPath) {
    throw new APIError(400, "Please upload both avatar");
  }

  const avatar = await uploadFile(avatarPath);
  let coverImage;
  //? If coverImagePath exists then upload
  if (coverImagePath) coverImage = await uploadFile(coverImagePath);

  if (!avatar) {
    throw new APIError(400, "Please upload both avatar");
  }
  console.log("Creating user...");

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
  });

  const userCreated = await User.findById(user._id).select("-password -refreshToken");

  if (!userCreated) {
    throw new APIError(400, "User not created");
  }
  console.log("User created");
  return res.status(201).json(new APIResponse(201, userCreated, "User created successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  console.log(
    "Login with",
    email ? "Email: " + email : "",
    username && email ? "and" : "",
    username ? "Username: " + username : "",
  );
  if (!(email || username)) {
    throw new APIError(400, "Email or username is required");
  }
  //? Check if user exists with email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordMatched = await user.isPasswordMatched(password);
  if (!isPasswordMatched) {
    throw new APIError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
  user.refreshToken = refreshToken; //! In this instance we are updating the refreshToken

  const loggedUser = user.toObject({ getters: true });
  delete loggedUser.password;
  delete loggedUser.refreshToken;

  //? Set cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIResponse(200, { user: loggedUser, tokens: { accessToken, refreshToken } }, "User logged in successfully"),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true },
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req?.cookies?.refreshToken || req?.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      throw new APIError(401, "Refresh token is required");
    }

    const decodedToken = await jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      throw new APIError(401, "User not found");
    }
    if (user.refreshToken !== refreshToken) {
      throw new APIError(401, "Invalid refresh token or expired");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    console.log("Refresh token received successfully");
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new APIResponse(
          200,
          { tokens: { accessToken, refreshToken: newRefreshToken } },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new APIError(401, "Invalid refresh token " + error.message);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (currentPassword === newPassword) {
    throw new APIError(400, "New password should not be same as current password");
  }
  if (!currentPassword || !newPassword) {
    throw new APIError(400, "Current password and new password is required");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError(404, "User not found");
  }

  const isPasswordMatched = await user.isPasswordMatched(currentPassword);

  if (!isPasswordMatched) {
    throw new APIError(401, "Current password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBefore: false });

  return res.status(200).json(new APIResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new APIResponse(200, req.user, "User fetched successfully"));
});
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, fullname, email } = req.body;

  // Ensure at least one of email or username is provided
  if (!(username || email)) {
    throw new APIError(400, "Give email or username at least");
  }

  // Proceed with the update if no conflicts found
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username ? username : req.user.username,
        fullname: fullname ? fullname : req.user.fullname,
        email: email ? email : req.user.email,
      },
    },
    { new: true },
  ).select("-password -refreshToken");

  console.log("User updated!");
  return res.status(200).json(new APIResponse(200, user, "User details updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(username);
  console.log("Fetching channel...");
  if (!username?.trim()) {
    throw new APIError(400, "Username is required");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: { $size: "$subscribers" },
        subscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribedToCount: 1,
        subscriberCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
        createdAt: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new APIError(404, "Channel not found");
  }
  console.log(channel);
  console.log("Channel fetched!");
  return res.status(200).json(new APIResponse(200, channel[0], "Channel fetched successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  getUserChannelProfile,
};
