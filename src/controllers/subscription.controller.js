import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import APIError from "../utils/APIError.utils.js";
import ApiResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Channel ID is required");
  }
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new APIError(404, "Channel not found");
  }
  const subscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });
  let isSubscribed = false;
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
  } else {
    isSubscribed = true;
    const newSubscription = await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channel: channel, isSubscribed: isSubscribed },
        isSubscribed ? "Subscribed successfully" : "Unsubscribed successfully",
      ),
    );
});
//* controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  console.log("subscriberId: ", subscriberId);
  if (!isValidObjectId(subscriberId)) {
    throw new APIError(400, "Channel ID is required");
  }
  const channel = await User.findById(subscriberId);
  if (!channel) {
    throw new APIError(404, "Channel not found");
  }
  const subscribers = await Subscription.find({ channel: subscriberId }).populate(
    "subscriber",
    "username fullname avatar",
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers: subscribers, totalSubscribers: subscribers.length },
        "Subscribers fetched successfully",
      ),
    );
});

//* controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(req);
  console.log("subscriberId: ", channelId);
  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Subscriber ID is required");
  }
  const subscriber = await User.findById(channelId);
  if (!subscriber) {
    throw new APIError(404, "Subscriber not found");
  }
  const subscribedChannels = await Subscription.find({ subscriber: channelId }).populate(
    "channel",
    "username fullname avatar",
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribedChannels: subscribedChannels, totalSubscribedChannels: subscribedChannels.length },
        "Subscribed channels fetched successfully",
      ),
    );
});

const ifChannelSubscribed = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(channelId)) {
    throw new APIError(400, "Channel ID is required");
  }
  const channel = await Subscription.findOne({ channel: channelId, subscriber: userId });
  if (channel) {
    return res.status(200).json(new ApiResponse(200, { isSubscribed: true }, "Channel is subscribed"));
  } else {
    return res.status(200).json(new ApiResponse(200, { isSubscribed: false }, "Channel is not subscribed"));
  }
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels, ifChannelSubscribed };
