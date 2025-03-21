import { Router } from "express";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import verifyAccessToken  from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAccessToken); //? Apply verifyJWT middleware to all routes in this file

//* Compound routes
router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
