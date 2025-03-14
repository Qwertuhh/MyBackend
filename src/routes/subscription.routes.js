import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import verifyAccessToken  from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAccessToken);

router.route("/c/:channelId").get(getSubscribedChannels).post(toggleSubscription);

router.route("/u/:subscriberId").get(getUserChannelSubscribers);

export default router;
