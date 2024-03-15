import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { Tweet } from "../models/tweet.model";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetContent } = req.body;
    if (!tweetContent) {
      throw new apiError(400, "Tweet field should not be empty");
    }

    const create = await User.create({
      content: tweetContent,
      owner: req.user._id,
    });
    if (!create) {
      throw new apiError(500, "Unable to create a tweet");
    }

    return res
      .status(201)
      .json(new apiResponse(201, "New tweet created successfully"));
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      throw new apiError(404, "User Id is required");
    }

    const tweetUser = await Tweet.findById(userId);
    if (!tweetUser) {
      throw new apiError(404, "Unable to find user");
    }

    const userTweets = await Tweet.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(tweetUser),
        },
      },
      {
        $project: {
          content: 1,
        },
      },
    ]);

    if (!userTweets) {
      throw new apiError(404, "No tweets found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, userTweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new apiError(500, error.message);
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { tweetContent } = req.body;

  if (!tweetId) {
    throw new apiError(401, "Tweet id is not available");
  }

  if (!tweetContent) {
    throw new apiError(401, "Tweet content is not available");
  }

  const tweetFound = await Tweet.findById(tweetId);
  if (!tweetFound) {
    throw new apiError(400, "Tweet is not available");
  }

  if (!(tweetFound.owner.toString() === req.user?._id.toString())) {
    throw new apiError(400, "User is not logged in by same id");
  }

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content: tweetContent,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedTweet) {
      throw new apiError(400, "Tweet updation failed");
    }

    return res
      .status(200)
      .json(new apiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    throw new apiError(400, error.message);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new apiError(400, "Tweet id is not available");
  }

  const tweetContent = await Tweet.findById(tweetId);
  if (!tweetContent) {
    throw new apiError(400, "Tweet content is not available");
  }

  if (!(tweetContent.owner.toString() === req.user?._id.toString())) {
    throw new apiError(400, "Tweet does not belong to user logged in");
  }

  try {
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId, {
      new: true,
    });
    if (!deletedTweet) {
      throw new apiError(400, "Tweet deletion failed");
    }
  } catch (error) {
    throw new apiError(401, error.message);
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
