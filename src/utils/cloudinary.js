import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath);

    console.log("File is uploaded successfull ", response.url);
    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); //remove file from local if error is found 
    return null;
  }
};

const deleteFile = async (publicid) => {
  try {
    if(!publicid){
      return "public id not found"
    }
    const deleteResponse = await cloudinary.uploader.destroy(publicid, {
      resource_type: "auto"
    })
    return deleteResponse;
  } catch (error) {
    return e.message
  }
}

export { uploadOnCloudinary, deleteFile };
