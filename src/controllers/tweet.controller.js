import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
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

//* Like model also use to fetch likes count
const getUserTweets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullname: 1,
              username: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ["$owner", 0] },
      },
    },
  ]);

  if (!tweets) {
    throw new APIError(404, "No tweets found of this user");
  }

  console.log("tweets fetched");
  return res.status(200).json(new APIResponse(200, { tweets, totalTweets: tweets.length }, "Tweets fetched successfully"));
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

  const tweet = await Tweet.findOneAndUpdate({ _id: tweetId, owner: userId }, { content: content , updatedAt: Date.now()}, { new: true });

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
  await Like.deleteMany({ tweet: tweetId });

  if (!tweet) {
    throw new APIError(404, "Tweet not found or You are not authorized to delete this tweet");
  }
  console.log("tweet deleted");
  return res.status(200).json(new APIResponse(200, { tweet }, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
