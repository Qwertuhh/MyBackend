import { isValidObjectId } from "mongoose";
import {Video} from "../models/video.model.js";
import APIError from "../utils/APIError.utils.js";
import APIResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const increamentViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Video ID is required");
    }
    const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });
    if (!video) {
        throw new APIError(404, "Video not found");
    }
    return res.status(200).json(new APIResponse(200, video, "Views incremented successfully"));
});

export { increamentViews };