import APIError from "../utils/APIError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config.js";
import { User } from "../models/user.model.js";

const verifyAccessToken = asyncHandler(async (req, _, next) => {
  try {
    //? To access token from cookies or authorization header
    const token = req?.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      throw new APIError(401, "Access token is required");
    }

    const decoded = await jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) {
      throw new APIError(401, "User not found");
    }

    //? Response Changed
    req.user = user;
    next();
  } catch (error) {
    throw new APIError(401, "Invalid access token" + error.message);
  }
});
export default verifyAccessToken;
