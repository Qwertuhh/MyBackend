class APIError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    console.log(this.data);
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    //? To capture the stack
    if (stack) {
      this.stack = stack;
    } else {
      //? Capturing the stack so that this does't get in the stack
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default APIError;
