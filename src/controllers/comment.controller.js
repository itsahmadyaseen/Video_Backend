import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

const fetchComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new apiError(400, "Video id is not found");
  }

  const video = await Comment.findById(videoId);
  if (!video) {
    throw new apiError(400, "Video is not found");
  }

  try {
    const fetchAllComments = await Comment.aggregate([
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "owner",
          foreignFields: "_id",
          as: "owner",
        },
      },
      {
        $lookup: {
          from: "like",
          localField: "_id",
          foreignFields: "comment",
          as: "likedBy",
        },
      },
      {
        $skip: (page - 1) * limi,
      },
      {
        $limit: limit,
      },
    ]);
    if (!fetchAllComments || !fetchAllComments.length > 0) {
      throw new apiError(400, "error occured whie finding comments");
    }

    return res
      .status(200)
      .json(new apiResponse(200, fetchAllComments, "comment found"));
  } catch (error) {
    throw new apiError(500, error.message);
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { commentData } = req.body;

  if (!commentData) {
    throw new apiError("Comment content is required");
  }

  try {
    const video = await Video.findById(videoId);

    const newComment = await Comment.create({
      content: commentData,
      video: video?.id,
      owner: req.user?._id,
    });
    if (!newComment) {
      throw new apiError(400, "Unable to create Comment");
    }

    return res
      .status(200)
      .json(new apiResponse(200, { newComment }, "Commnet added successfully"));
  } catch (error) {
    throw new apiError(500, "Error while adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { commentBody } = req.body;

  if (!commentId) {
    throw new apiError(401, "Comment id not available");
  }
  if (!commentBody) {
    throw new apiError(404, "Comment body is required");
  }

  const comment = await Comment.findById(commentId);
  if (!commentId) {
    throw new apiError(404, "Comment is not found");
  }

  if (!(comment.owner.toString() === req.user?._id.toString())) {
    throw new apiError(400, "You can update only your comment");
  }

  try {
    const newComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $set: {
          comment: commentBody,
        },
      },
      { new: true }
    );

    if (!newComment) {
      throw new apiError(401, "Comment updation failed");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Comment updated successfully"));
  } catch (error) {
    throw new apiError(
      400,
      error.message,
      "Error occured while updating comment"
    );
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new apiError(401, "Comment id not found");
  }

  const comment = await Comment.findById(commentId);
  if (!commentId) {
    throw new apiError(404, "Comment is not found");
  }

  if (!(comment.owner.toString() === req.user?._id.toString())) {
    throw new apiError(400, "You can delete only your comment");
  }

  try {
    const commentDeleted = await Comment.findByIdAndDelete(commentId);
    if (!commentDeleted) {
      throw new apiError(400, "Comment deletion failed");
    }
    return res
      .status(200)
      .json(new apiResponse(200, "Comment deleted successfully"));
  } catch (error) {
    throw new apiError(401, error.message, "Comment deletion failed");
  }
});

export { fetchComments, addComment, updateComment, deleteComment };
