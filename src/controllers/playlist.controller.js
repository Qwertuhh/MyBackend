import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;
  if (!title || !description) {
    throw new APIError(400, "Name and description are required");
  }
  const existingPlaylist = await Playlist.findOne({ title, owner: userId });
  if (existingPlaylist) {
    throw new APIError(409, "Playlist with same title already exists");
  }
  const playlist = await Playlist.create({
    title,
    description,
    owner: userId,
  });
  return res.status(201).json(new APIResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user ID");
  }
  const playlists = await Playlist.find({ owner: userId });
  if (!playlists) {
    throw new APIError(404, "Playlists not found");
  }
  return res.status(200).json(new APIResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }
  return res.status(200).json(new APIResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid playlist ID or video ID");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  if (!playlist.videos.includes(video._id)) {
    playlist.videos.push(video._id);
    await playlist.save();
  }
  return res.status(200).json(new APIResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid playlist ID or video ID");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new APIError(404, "Video not found");
  }
  playlist.videos.pull(video);
  await playlist.save();
  return res.status(200).json(new APIResponse(200, playlist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist ID");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }
  return res.status(200).json(new APIResponse(200, playlist, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist ID");
  }
  if (!title && !description) {
    throw new APIError(400, "Nothing to update");
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, { title, description }, { new: true });
  if (!playlist) {
    throw new APIError(404, "Playlist not found");
  }
  return res.status(200).json(new APIResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
