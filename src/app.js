import express from "express";
import cors from "cors";
import { CORS_ORIGIN } from "./config.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true })); //? For Nested Objects
app.use(express.static("public"));
app.use(cookieParser());

//* Routes
import userRoutes from "./routes/user.routes.js";
import healthcheckRoutes from "./routes/healthcheck.routes.js";
import comment from "./routes/comment.routes.js";
import Tweet from "./routes/tweet.routes.js";
import Video from "./routes/video.routes.js";
import Like from "./routes/like.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/healthcheck", healthcheckRoutes);
app.use("/api/v1/comments", comment);
app.use("/api/v1/tweets", Tweet);
app.use("/api/v1/videos", Video);
app.use("/api/v1/Likes", Like);
export default app;