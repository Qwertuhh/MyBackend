import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId, //? Channel Subscriber (follower)
    ref: "User",
    required: false,
  },
  channelOwner: {
    type: mongoose.Schema.Types.ObjectId, //? Channel Owner
    ref: "User",
    required: true,
  },
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
