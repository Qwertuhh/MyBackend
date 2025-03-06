import asyncHandler from "../utils/asyncHandler.js";
import APIError from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import uploadFile from "../utils/fileUpload.js";
import APIResponse from "../utils/APIResponse.js";
import deleteFile from "../utils/deleteFile.js";

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarFile = req?.file?.path;
  if (!avatarFile) {
    throw new APIError(400, "Please upload a file");
  }

  const avatar = await uploadFile(avatarFile);
  if (!avatar?.url) {
    throw new APIError(400, "Something went wrong while uploading the file");
  }
  await deleteFile(req.user.avatar); //? Delete the previous avatar

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: avatar.url,
    },
    { new: true },
  ).select("-password -refreshToken");

  return res.status(200).json(new APIResponse(200, user, "Avatar Updated Successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImagePath = req?.file?.path;
  if (!coverImagePath) {
    throw new APIError(400, "Please upload a file");
  }

  const coverImage = await uploadFile(coverImagePath);

  if (!coverImage?.url) {
    throw new APIError(400, "Something went wrong while uploading the file");
  }
  await deleteFile(req.user.coverImage); //? Delete the previous CoverImage

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: coverImage.url,
    },
    { new: true },
  ).select("-password -refreshToken");

  return res.status(200).json(new APIResponse(200, user, "CoverImage Updated Successfully"));
});

export { updateUserAvatar, updateUserCoverImage };
