import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { deleteFile, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType, userId, query } = req.query;
  const sortOptions = {};

  if (sortBy) {
    sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
  }

  let basequery = {
    owner: new mongoose.Types.ObjectId(userId)
  };

  if (query) {
    const regexQuery = new RegExp(query, 'i');
    basequery.$or = [
      { title: regexQuery },
      { description: regexQuery }
    ];
  }

  try {
    console.log("Base Query:", basequery);

    const result = await Video.aggregate([
      {
        $match: basequery
      },
      {
        $sort: sortOptions
      },
      {
        $skip: (page - 1) * limit
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    console.log("Query Result:", result);

    return res.status(200).json(new apiResponse(200, { result }, "Success"));
  } catch (e) {
    console.error("Error:", e);
    throw new apiError(500, e.message);
  }
});




const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?._id;

    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if (!videoFileLocalPath) {
      throw new apiError(400, "Video file required");
    }
    if (!thumbnailLocalPath) {
      throw new apiError(400, "Thumbnail is required");
    }

    const uploadVideo = await uploadOnCloudinary(videoFileLocalPath);
    if (!uploadVideo) {
      throw new apiError(400, "Upload video error");
    }
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(uploadVideo || uploadThumbnail)) {
      throw new apiError(400, "Upload thumbnail error");
    }

    const publish = await Video.create({
      videoFile: uploadVideo.url,
      thumbnail: uploadThumbnail.url,
      title,
      description,
      duration: uploadVideo.duration,
      cloudinaryVideoId: uploadVideo.public_id,
      cloudinaryThumbnailId: uploadThumbnail.public_id,
      owner: userId,
    });

    if (!publish) {
      throw new apiError(500, "Something went wrong while uploading");
    }

    return res
      .status(200)
      .json(200, { publish }, "Video published successfully");
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

//complete
const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoUrl = await Video.findById(videoId);
    if (!videoUrl) {
      throw new apiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, { videoUrl }, "Video fetched successfully"));
  } catch (error) {
    throw new apiError(404, error.message);
  }
});

//complete
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const localFilePathToUpload = req.file.path;

  if (!localFilePathToUpload) {
    throw new apiError(404, "File not found");
  }

  const cloudinaryUpload = await uploadOnCloudinary(localFilePathToUpload);

  if (!cloudinaryUpload.url) {
    throw new apiError(404, "Error while uploading to cloud");
  }

  const public_id_video = await Video.findById(videoId);

  const deleteVideoOnServer = await deleteFile(
    public_id_video.cloudinaryThumbnailId
  );

  const uploadVideoOnServer = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: cloudinaryUpload.url,
        cloudinaryThumbnailId: cloudinaryUpload.public_id,
        title: title,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  if (!uploadVideoOnServer) {
    throw new apiError(404, "Error while uploading to server");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, { uploadOnCloudinary }, "Video updated successfully")
    );
});

//completed
const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    const public_video_id = await Video.findById(videoId);
    if (!public_video_id) {
      throw new apiError(404, "Video not found");
    }

    const cloudinaryId = public_video_id.get("cloudinaryVideoId");

    const deleteCloudinaryFile = await deleteFile(cloudinaryId);
    if (!deleteCloudinaryFile.result) {
      throw new apiError(500, "Unable to delete file from cloudinary");
    }

    const deleteDbFile = await Video.findByIdAndDelete(public_video_id);
    if (!deleteDbFile) {
      throw new apiError(500, "Unable to delete file from database");
    }

    return res
      .status(200)
      .json(
        new apiResponse(200, { deleteDbFile }, "File deleted successfully")
      );
  } catch (error) {
    throw new apiError(500, "Error deleting video " + error.message);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const newPublishStatus = !video.isPublished;

  const togglePublish = await Video.findByIdAndUpdate(
    videoId,
    { isPublished: newPublishStatus },
    { new: true }
);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { togglePublish },
        "Publish status toggled successfully"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
