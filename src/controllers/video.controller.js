import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import deleteFile from "../utils/deleteFile.utils.js";
import fileUpload from "../utils/fileUpload.utils.js";

//* Like model also use to fetch likes count
const getAllVideos = asyncHandler(async (req, res) => {
  //? In One Page it gives 10 videos by default
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (userId && !isValidObjectId(userId)) {
    throw new APIError(400, "Please provide a valid userId");
  }

  const validSortFields = ["title", "views", "likes", "createdAt"];
  if (sortBy && !validSortFields.includes(sortBy)) {
    throw new APIError(400, `Invalid sort field. Valid fields are: ${validSortFields.join(", ")}`);
  }

  const validSortTypeFields = ["a", "d"];
  if (sortType && !validSortTypeFields.includes(sortType)) {
    throw new APIError(400, "Invalid sort type. Valid types are: a (ascending) or d (descending)");
  }
  //? Sort Options
  const sortOptions = {
    createdAt: -1,
  };
  if (sortBy) {
    sortOptions[sortBy] = sortType === "d" ? -1 : 1;
  }

  let pipeline = [];
  if (query) {
    pipeline.push({
      $search: {
        index: "search",
        text: {
          query: query,
          path: {
            wildcard: "*",
          },
        },
      },
    });
  }
  pipeline.push(
    {
      $match: {
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
    { $sort: sortOptions },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  );

  if (userId) {
    pipeline.shift(); //? To remove the $search pipleline
    pipeline.unshift({ $match: { "creator._id": new mongoose.Types.ObjectId(userId) } });
  }
  const videos = await Video.aggregate(pipeline);

  const totalVideos = await Video.countDocuments();

  return res.status(200).json(new APIResponse(200, { videos, totalVideos }, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;
  const videoFilePath = req?.files?.videoFile[0].path;
  const thumbnailPath = req?.files?.thumbnail[0].path;
  console.log(videoFilePath, thumbnailPath);

  if (!title || !description || !videoFilePath || !thumbnailPath) {
    throw new APIError(400, "Please provide all the required fields");
  }

  const videoFile = await fileUpload(videoFilePath, true);
  const thumbnailFile = await fileUpload(thumbnailPath, true);
  const user = await User.findById(userId);
  if (!user) {
    throw new APIError(404, "User not found");
  }
  const creator = { _id: user._id, username: user.username, fullname: user.fullname };
  console.log(creator);
  if (!videoFile || !thumbnailFile) {
    throw new APIError(500, "Failed to upload video or thumbnail");
  }
  if (!videoFile.url || !thumbnailFile.url) {
    throw new APIError(500, "Failed to upload video or thumbnail");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    creator: creator,
    duration: videoFile.duration,
    views: 0,
    likes: 0,
  });

  if (!video) {
    throw new APIError(500, "Failed to publish video");
  }
  console.log(video);
  console.log("Video published successfully");
  return res.status(201).json(new APIResponse(201, video, "Video published successfully"));
});

//* Like model also use to fetch likes count
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likes: { $size: "$likes" },
      },
    },
  ]);
  if (!video || !video.length) {
    throw new APIError(404, "Video not found");
  }
  console.log("Video fetched successfully");
  return res.status(200).json(new APIResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const title = req.body.title;
  const description = req.body.description;
  const thumbnailPath = req?.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }

  if (!title && !description && !thumbnailPath) {
    throw new APIError(400, "Nothing to update");
  }

  const thumbnailFile = await fileUpload(thumbnailPath, true);
  if (!thumbnailFile) {
    throw new APIError(500, "Failed to upload thumbnail");
  }

  const video = await Video.findById(videoId);
  await deleteFile(video.thumbnail, true);

  //* Update video on called Instance of Video and save it
  video.thumbnail = thumbnailFile.url;
  video.title = title || video.title;
  video.description = description || video.description;
  await video.save();
  console.log("Video updated successfully");
  return res.status(200).json(new APIResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new APIError(404, "Video not found");
  }

  await deleteFile(video.videoFile, true, true);
  await deleteFile(video.thumbnail, true);

  console.log("Video deleted successfully");
  return res.status(200).json(new APIResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }
  const video = await Video.findByIdAndUpdate(videoId, { isPublished: true }, { new: true });
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  return res.status(200).json(new APIResponse(200, video, "Video published successfully"));
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
