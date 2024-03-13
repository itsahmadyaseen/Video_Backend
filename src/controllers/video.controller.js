import mongoose from "mongoose";
import { Video } from "../models/video.model";
import { asyncHander } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  deleteFile,
  deleteFile,
  uploadOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHander(async (req, res) => {
  console.log(req.query);
  const { page = 1, limit = 10, sortBy, sortType, userId } = req.query;
  const sortOptions = {};

  if (sortBy) {
    sortOptions[sortBy] = sortType == "desc" ? -1 : 1;
  }

  const basequery = {};
  //DOUBT
  if (query) {
    basequery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  try {
    const result = await Video.aggregate(
      {
        $match: {
          ...basequery,
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $sort: sortOptions,
      },
      {
        $skip: (page - 1) * 10,
      },
      {
        $limit: parseInt(limit),
      }
    );

    return res
      .status(200)
      .json(new apiResponse(200, { result }, "Fetched videos successfully"));
  } catch (error) {
    throw new apiError(error.message);
  }
});

const publishAVideo = asyncHander(async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id;
    const videoFileLocalPath = req.files?.videoFile?.[0].path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

    if (!videoFileLocalPath) {
      throw new apiError(400, "Video file required");
    }
    if (!thumbnailLocalPath) {
      throw new apiError(400, "Thumbnail required");
    }

    const uploadVideo = await uploadOnCloudinary(videoFileLocalPath);
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(uploadVideo || uploadThumbnail)) {
      throw new apiError(400, "Upload video error");
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

const getVideoById = asyncHander(async (req, res) => {
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

const updateVideo = asyncHander(async (req, res) => {
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

const deleteVideo = asyncHander(async (req, res) => {
  try {
    const { video_id } = req.params;
    const public_video_id = await Video.findById(video_id);
    if (!public_video_id) {
      throw new apiError(404, "Video not found");
    }

    const cloudinaryId = public_video_id.get("cloudinaryVideoId");

    const deleteCloudinaryFile = await deleteFile(cloudinaryId);
    if (!deleteCloudinaryFile.result) {
      throw new apiError(500, "Unable to delete file on cloudinary");
    }

    const deleteDbFile = await Video.findByIdAndDelete(public_video_id);
    if (!deleteDbFile) {
      throw new apiError(500, "Unable to delete file on database");
    }

    return res
      .status(200)
      .json(new apiResponse(200, { deleteDbFile }, "File deleted successfully"));
  } catch (error) {
    throw new apiError(500, "Error deleting video " + error.message);
  }
});

const togglePublishStatus = asyncHander(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const newPublishStatus = !video.isPublished;

  const togglePublish = await Video.findOneAndUpdate(
    { _id: videoId },
    { $set: { isPublished: newPublishStatus } },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, {togglePublish}, "Publish status toggled successfully"))
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
