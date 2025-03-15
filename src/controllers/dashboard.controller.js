import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const stats = await User.aggregate([
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "creator._id",
        as: "videos",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "totalLikesEarned",
      },
    },
    {
      $addFields: {
        totalsubscriber: { $size: "$subscriber" },
        totalVideosUploaded: { $size: "$videos" },
        totalLikesEarned: {
          $size: "$totalLikesEarned",
        },
        totalViews: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        videos: 0,
      },
    },
  ]);

  if (!stats) {
    throw new APIError(404, "Channel not found");
  }

  return res.status(200).json(new APIResponse(200, stats[0], "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const videos = await User.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "creator._id",
        as: "videos",
      },
    },
    {
      $addFields: {
        totalVideos: { $size: "$videos" },
      },
    },
    {
      $project: {
        videos: 1,
        totalVideos: 1,
      },
    },
  ]);
  if (!videos) {
    throw new APIError(404, "Channel not found");
  }
  return res.status(200).json(new APIResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
