import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//! Liked To Schema if we want to use this structure
// const likedToSchema = new mongoose.Schema({
//   likedTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//     refPath: "onModel",
//   },
//   onModel: {
//     type: String,
//     required: true,
//     enum: ["User", "Tweet"],
//   },
// });

const likeSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    tweet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
    //! This is the new field we are adding to the like model
    // likedTo: {
    //     type: likedToSchema,
    //     required: true,
    // },
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);
likeSchema.plugin(mongooseAggregatePaginate);
export const Like = mongoose.model("Like", likeSchema);
