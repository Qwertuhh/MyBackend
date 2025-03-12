import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import deleteFile from "../utils/deleteFile.utils.js";
import fileUpload from "../utils/fileUpload.utils.js";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
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

  if (!videoFile || !thumbnailFile) {
    throw new APIError(500, "Failed to upload video or thumbnail");
  }
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnailFile.url,
    creator: userId,
    duration: videoFile.duration,
    views: 0,
    likes: 0,
  });

  if (!video) {
    throw new APIError(500, "Failed to publish video");
  }
  console.log("Video published successfully");
  return res.status(201).json(new APIResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId).populate("creator", "fullname username");
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  console.log("Video fetched successfully");
  return res.status(200).json(new APIResponse(200, video, "Video fetched successfully"));
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
  // const video = await Video.findByIdAndDelete(videoId);
  const  video = await Video.findById(videoId);
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  console.log(video);
  await deleteFile(video.videoFile, true);
  console.log("Video file deleted successfully");
  await deleteFile(video.thumbnail, true);

  console.log("Video deleted successfully");
  return res.status(200).json(new APIResponse(200, {}, "Video deleted successfully"));
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
