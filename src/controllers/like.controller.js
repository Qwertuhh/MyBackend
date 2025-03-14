import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

//! make tweet and comment to like model

//* Video Model also updated with likes model
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video ID");
  }
  const like = Like.create({
    video: videoId,
    likedBy: userId,
  });
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $inc: { likes: 1 },
    },
    { new: true },
  );
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  return res.status(200).json(new APIResponse(200, { video: video, like: like }, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(commentId)) {
    throw new APIError(400, "Invalid video ID");
  }
  const like = await Like.create({
    comment: commentId,
    likedBy: userId,
  });
  if (!like) {
    throw new APIError(404, "Comment not found");
  }
  return res.status(200).json(new APIResponse(200, like, "Video liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }
  const like = await Like.create({ tweet: tweetId, likedBy: userId });
  if (!like) {
    throw new APIError(404, "Tweet not found");
  }
  return res.status(200).json(new APIResponse(200, like, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likes = await Like.find({ likedBy: userId, video: { $exists: true } }).populate("video").lean();
  const totalLikedVideos = likes.length;
  return res
    .status(200)
    .json(
      new APIResponse(200, { likes: likes, totalLikedVideos: totalLikedVideos }, "Liked videos fetched successfully"),
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
