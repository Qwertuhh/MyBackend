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

export default app;