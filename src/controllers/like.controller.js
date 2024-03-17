import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id.toString();

  try {
    const condition = { video: videoId, likedBy: userId };
    const alreadyLiked = await Like.findOne(condition);

    if (alreadyLiked) {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(
          new apiResponse(200, { removeLike }, "Like is removed successfully")
        );
    } else {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(
          new apiResponse(200, { createLike }, "Like is added successfully")
        );
    }
  } catch (error) {
    throw new apiError(500, error.message, "Error occured while toggling like");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id.toString();

  try {
    const condition = { video: videoId, likedBy: userId };
    const alreadyLiked = await Like.findOne(condition);

    if (alreadyLiked) {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { removeLike },
            "Like is removed from comment successfully"
          )
        );
    } else {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { createLike },
            "Like is added to comment successfully"
          )
        );
    }
  } catch (error) {
    throw new apiError(
      500,
      error.message,
      "Error occured while toggling like in comment"
    );
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id.toString();

  try {
    const condition = { video: videoId, likedBy: userId };
    const alreadyLiked = await Like.findOne(condition);

    if (alreadyLiked) {
      const removeLike = await Like.findOneAndDelete(condition);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { removeLike },
            "Like is removed from tweet successfully"
          )
        );
    } else {
      const createLike = await Like.create(condition);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { createLike },
            "Like is added to tweet successfully"
          )
        );
    }
  } catch (error) {
    throw new apiError(500, error.message, "Error occured while toggling like");
  }
});

const getLikedVideo = asyncHandler(async (req, res) => {
  const userId = req.user?._id.toString();

  try {
    const allLiked = await Like.find({
      likedBy: userId,
      video: { $exists: true },
    });
    return res
      .status(200)
      .json(
        new apiResponse(200, { allLiked }, "Liked videos fetched successfully")
      );
  } catch (error) {
    throw new apiError(
      500,
      error.message,
      "Error occured while fetching liked videos"
    );
  }
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideo };
