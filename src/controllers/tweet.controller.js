import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const createTweet = asyncHandler(async (req, res) => {
  if (!req.body.content) {
    throw new APIError(400, "Content is required");
  }
  const tweet = await Tweet.create({
    content: req.body.content,
    owner: req.user._id,
  });

  console.log("tweet created");
  return res.status(201).json(new APIResponse(201, { tweet }, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  if (!isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user ID");
  }
  const tweets = await Tweet.find({ owner: userId }).populate("owner", "fullname username -_id").select("-__v");

  if (!tweets) {
    throw new APIError(404, "No tweets found of this user");
  }

  console.log("tweets fetched");
  return res.status(200).json(new APIResponse(200, { tweets }, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const content = req.body.content;
  const tweetId = req.params.tweetId;
  const userId = req.user._id;

  if (!content) {
    throw new APIError(400, "Content is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findOneAndUpdate({ _id: tweetId, owner: userId }, { content: content }, { new: true });

  if (!tweet) {
    throw new APIError(404, "Tweet not found or You are not authorized to update this tweet");
  }

  console.log("tweet updated");
  return res.status(200).json(new APIResponse(200, { tweet }, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new APIError(400, "Invalid tweet ID");
  }

  const tweet = await Tweet.findOneAndDelete({ _id: tweetId, owner: userId });

  if (!tweet) {
    throw new APIError(404, "Tweet not found or You are not authorized to delete this tweet");
  }
  console.log("tweet deleted");
  return res.status(200).json(new APIResponse(200, { tweet }, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
