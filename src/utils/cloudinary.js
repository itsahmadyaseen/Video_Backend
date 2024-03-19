import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File is uploaded successfull ", response.url);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); //remove file from local if error is found
    return null;
  }
};

const deleteFile = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error("Public ID not provided");
    }
    const deleteResponse = await cloudinary.uploader.destroy(publicId);
    return deleteResponse;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

export { uploadOnCloudinary, deleteFile };
