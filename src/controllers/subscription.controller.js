import { Subscription } from "../models/subsciption.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  try {
    const condition = { subscriber: req.user._id, channel: channelId };

    const alreadySubscribed = await Subscription.findOne(condition);

    if (alreadySubscribed) {
      const unsubscribe = await Subscription.findOneAndDelete(condition);
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { unsubscribe },
            "Channel unsubscribed successfully"
          )
        );
    } else {
      const subscibe = await Subscription.create(condition);
      return res
        .status(200)
        .json(
          new apiResponse(200, { subscibe }, "Channel subscribed successfull")
        );
    }
  } catch (error) {
    throw new apiError(
      400,
      error.message,
      "Error occured while toggle subscribe"
    );
  }
});

const getUserChannelSubscriber = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  try {
    const subscribers = await Subscription.find({ channel: subscriberId });
    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { subscribers },
          "User subscribers fetched successfully"
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error.message,
      "Error occurred while fetching user subscribers"
    );
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  try {
    const subscribedTo = await Subscription.find({ subsciber: userId });

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { subscribedTo },
          "User subscribed channels fetched"
        )
      );
  } catch (error) {
    throw new apiError(
      500,
      error.message,
      "Error occured while fetching user subscribed channels"
    );
  }
});

export { 
    toggleSubscription,
    getUserChannelSubscriber,
    getSubscribedChannels
};
