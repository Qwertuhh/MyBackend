import asyncHandler from "../utils/asyncHandler.js";
import APIError from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import uploadFile from "../utils/fileUpload.js";
import APIResponse from "../utils/APIResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const exitedUser = await User.findOne({
    $or: [{ email }, { username }],
  });


  if (!exitedUser) {
    new APIError(409, "User already exists");
  }


  const avatarPath = req?.files?.avatar[0].path;
  let coverImagePath;
  if(req?.files?.coverImage) coverImagePath = req?.files?.coverImage[0].path;
  console.log("File Path: ",avatarPath, coverImagePath);

  if (!avatarPath) {
    throw new APIError(400, "Please upload both avatar");
  }

  const avatar = await uploadFile(avatarPath);
  let coverImage;
  //? If coverImagePath exists then upload
  if (coverImagePath) coverImage = await uploadFile(coverImagePath);
  
  if (!avatar) {
    throw new APIError(400, "Please upload both avatar");
  }
  console.log("Creating user...");

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || null,
  });

  const userCreated = await User.findById(user._id).select("-password -refreshToken");

  if (!userCreated) {
    throw new APIError(400, "User not created");
  }
  console.log("User created");
  return res.status(201).json(new APIResponse(201, userCreated, "User created successfully"));
});

export { registerUser };
