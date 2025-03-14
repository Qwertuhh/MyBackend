import { Router } from "express";
import { increamentViews } from "../controllers/views.controller.js";
import verifyAccessToken from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyAccessToken);

router.route("/:videoId").get(increamentViews);

export default router;

