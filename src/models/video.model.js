import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CloudinaryURL = String;
const creatorSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  username: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
});
const videoSchema = new Schema(
  {
    videoFile: {
      type: CloudinaryURL,
      required: true,
    },
    thumbnail: {
      type: CloudinaryURL,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: creatorSchema,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);
