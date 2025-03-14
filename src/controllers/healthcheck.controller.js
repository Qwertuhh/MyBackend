import ApiResponse from "../utils/APIResponse.utlis.js";
import asyncHandler from "../utils/asyncHandler.utils.js";

const healthcheck = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, "OK"));
});

export { healthcheck };
