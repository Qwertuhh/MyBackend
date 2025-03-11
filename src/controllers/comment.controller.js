import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import ApiError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

//* To get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const { page = 1, limit = 10 } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const comments = await Comment.aggregatePaginate(Comment.find({ video: mongoose.Types.ObjectId(videoId) }), options);
  if (!comments) {
    throw new ApiError(404, "No comments found for this video");
  }
  return res.status(200).json(new APIResponse(200, comments, "Comments retrieved successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const newComment = Comment.create({ content, owner: req.user._id, video: videoId });
  if (!newComment) {
    throw new ApiError(400, "Failed to add comment");
  }
  return res.status(201).json(new APIResponse(201, newComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  //? Validate comment ID
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const updatedComment = Comment.findByIdAndUpdate({ _id: new mongoose.Types.ObjectId(commentId) }, { content });
  if (!updatedComment) {
    throw new ApiError(400, "Failed to update comment");
  }
  return res.status(200).json(new APIResponse(200, updateComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  const deletedComment = Comment.findByIdAndDelete({ _id: new mongoose.Types.ObjectId(commentId) });
  if (!deletedComment) {
    throw new ApiError(400, "Failed to delete comment");
  }
  return res.status(200).json(new APIResponse(200, deletedComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
