class ApiSuccess {
  statusCode: number;
  message: string;
  data: any;
  success: boolean;
  constructor(statusCode: number, message: string, data: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;
  }
}

class ApiError extends Error {
  statusCode: number;
  message: string;
  data: null;
  error: any[];
  success: boolean;
  constructor(
    statusCode: number,
    message: string = "Something went wrong!",
    error: any[],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError, ApiSuccess };
