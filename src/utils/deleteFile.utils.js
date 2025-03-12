import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config.js";
import { cloudinaryUserFolderPath, cloudinaryVideoFolderPath } from "../constants.js";
import APIError from "./APIError.utils.js";
//! Delete file issue has to fix
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const deleteFile = async (fileURL, isVideo=false) => {
  let publicId = `${cloudinaryUserFolderPath}/${fileURL.split("/").pop().split(".")[0]}`; //? Extract the public ID from the file URL
  if (isVideo) {
    publicId = `${cloudinaryVideoFolderPath}/${fileURL.split("/").pop().split(".")[0]}`;
  }
  try {
    console.log(`Deleting file "${publicId}" ...`);
    const result = await cloudinary.uploader.destroy(publicId); //? Delete the file from Cloudinary

    console.log("Result: ", result);

    //* Handle errors based on Cloudinary's response
    if (result.result !== "ok" || result.error) {
      throw new APIError(
        400,
        `Something went wrong while deleting the file : ${result.error?.message || "File not found"}`,
      );
    }

    console.log("File deleted successfully");
  } catch (error) {
    throw new APIError(500, error.message || "Internal server error during file deletion"+error.message);
  }
};

export default deleteFile;
