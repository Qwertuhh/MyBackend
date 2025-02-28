import { Schema , model} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const CloudinaryURL = String;

const videoSchema = new Schema({
    videoFile: {
        type: CloudinaryURL,
        required: true
    },
    thumbnail: {
        type: CloudinaryURL,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0,
        required: true
    },
    likes: {
        type: Number,
        default: 0,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }

},{ timestamps: true });

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = model("Video", videoSchema);