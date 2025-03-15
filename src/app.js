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
import Views from "./routes/views.routes.js";
import Subscription  from "./routes/subscription.routes.js";
import Dashboard from "./routes/dashboard.routes.js";
import Playlist  from "./routes/playlist.routes.js";
const server = "/api/v1";
app.use(`${server}/users`, userRoutes);
app.use(`${server}/healthcheck`, healthcheckRoutes);
app.use(`${server}/comments`, comment);
app.use(`${server}/tweets`, Tweet);
app.use(`${server}/videos`, Video);
app.use(`${server}/likes`, Like);
app.use(`${server}/views`, Views);
app.use(`${server}/subscriptions`, Subscription);
app.use(`${server}/dashboard`, Dashboard);
app.use(`${server}/playlists`, Playlist);
export default app;