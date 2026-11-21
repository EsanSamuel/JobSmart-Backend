"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiSuccess = exports.ApiError = void 0;
class ApiSuccess {
    statusCode;
    message;
    data;
    success;
    constructor(statusCode, message, data) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode < 400;
    }
}
exports.ApiSuccess = ApiSuccess;
class ApiError extends Error {
    statusCode;
    message;
    data;
    error;
    success;
    constructor(statusCode, message = "Something went wrong!", error, stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.error = error;
        this.data = null;
        this.success = false;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.ApiError = ApiError;
