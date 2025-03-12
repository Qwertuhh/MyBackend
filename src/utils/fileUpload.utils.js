import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config.js";
import { cloudinaryUserFolderPath, cloudinaryVideoFolderPath } from "../constants.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath, isVideoAsset = false) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }
  let cloudinaryFolderPath = cloudinaryUserFolderPath;
  if (isVideoAsset) {
    cloudinaryFolderPath = cloudinaryVideoFolderPath;
  }
  const uploadResult = await cloudinary.uploader
    .upload(filePath, {
      folder: cloudinaryFolderPath,
      resource_type: "auto",
    })
    .catch(error => {
      console.log(error);

      //? To delete the file
      fs.unlinkSync(filePath);
    });
  console.log("File uploaded successfully");
  fs.unlinkSync(filePath);
  return uploadResult;
};

export default uploadFile;
