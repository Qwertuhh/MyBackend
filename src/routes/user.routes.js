import { Router } from "express";
const router = Router();
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  registerUser,
  changeCurrentPassword,
  updateAccountDetails,
  getUserChannelProfile,
} from "../controllers/user.controller.js";
import { updateUserAvatar, updateUserCoverImage } from "../controllers/filesUpdate.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyAccessToken from "../middlewares/auth.middleware.js";

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

//* Secured Routes
router.route("/current-user").get(verifyAccessToken, getCurrentUser);

router.route("/logout").post(verifyAccessToken, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyAccessToken, changeCurrentPassword);

router.route("/update-account").patch(verifyAccessToken, updateAccountDetails);
router.route("/update-avatar").patch(verifyAccessToken, upload.single("avatar"), updateUserAvatar);
router.route("/update-cover-image").patch(verifyAccessToken, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyAccessToken, getUserChannelProfile);
// router.route("/history").get(verifyAccessToken, getWatchHistory);
export default router;
