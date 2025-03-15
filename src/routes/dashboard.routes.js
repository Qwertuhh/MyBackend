import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";
import verifyAccessToken  from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyAccessToken); 

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
