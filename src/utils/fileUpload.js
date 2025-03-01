import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadFile = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error("File not found");
  }
  const uploadResult = await cloudinary.uploader
    .upload(filePath, {
      resource_type: "auto",
      public_id: "shoes",
    })
    .catch((error) => {
      console.log(error);

      //? To delete the file
      fs.unlink(filePath); //! Async to delete file
    });
  console.log("Upload result: ", uploadResult, uploadFile.url);
  fs.unlink(filePath);
  return uploadResult;
};

export default uploadFile;
