// ? Handle with try catch
/*
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      message: error.message,
      success: false,
    });
  }
};
*/

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(error.code || 500).json({
      message: error.message,
      success: false,
    });
    next(error);
  });
};

export default asyncHandler;
