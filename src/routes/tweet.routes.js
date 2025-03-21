import { Router } from "express";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";
import verifyAccessToken from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAccessToken); //? Apply verifyJWT middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
