import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    const obj = {};

    const videoDetails = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "totalVideos",
        },
      },
      {
        $addField: {
          totalVideos: { $sum: "$totalVideos" },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalVideos: { $sum: 1 },
          totalViews: { $sum: "$totalVideos.views" },
          totalSubscribers: { $first: { $size: "$subsribers" } },
        },
      },
      {
        $project: {
          totalVideos: 1,
          totalViews: 1,
          totalSubscribers: 1,
        },
      },
    ]);
    if (!videoDetails) {
      obj["videosDetails"] = [];
    }

    const likesDetailsOfVideos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "videos",
          as: "totalVideoLikes",
        },
      },
      {
        $unwind: "$totalVideoLikes",
      },
      {
        $group: {
          _id: "$totalVideoLikes._id",
        },
      },
      {
        $count: "totalLikes",
      },
    ]);
    if (!likesDetailsOfVideos) {
      obj["videoLikesDetails"] = [];
    }

    const likesDetailsOfComments = await Comment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "comments",
          as: "totalCommentLikes",
        },
      },
      {
        $unwind: "$totalCommentLikes",
      },
      {
        $group: {
          _id: "$totalCommentLikes._id",
        },
      },
      {
        $count: "totalLikes",
      },
    ]);
    if (!likesDetailsOfComments) {
      obj["commentsLikesDetails"] = [];
    }

    const likesDetailsOfTweets = await Comment.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "tweets",
          as: "totalTweetsLikes",
        },
      },
      {
        $unwind: "$totalTweetsLikes",
      },
      {
        $group: {
          _id: "$totalTweetsLikes._id",
        },
      },
      {
        $count: "totalLikes",
      },
    ]);

    if (!likesDetailsOfTweets) {
      obj["tweetsLikesDetails"] = [];
    }

    obj["videosDetails"] = videoDetails;
    obj["videoLikesDetails"] = likesDetailsOfVideos;
    obj["commentsLikesDetails"] = likesDetailsOfComments;
    obj["tweetsLikesDetails"] = likesDetailsOfTweets;

    return res
      .status(200)
      .json(new apiResponse(200, obj, "Channel status fetched succefully"));
  } catch (error) {
    throw new apiError(500, "Error occured while fetching channel status");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({
    owner: req.user?._id,
  });
  if (!(videos || videos.length > 0)) {
    throw new apiError(404, "Videos not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Channel Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
