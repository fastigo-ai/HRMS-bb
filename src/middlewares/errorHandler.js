import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

// Handle Mongoose CastError (e.g., invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate key error
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : "value";
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle Mongoose ValidationError
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle Multer upload errors
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new AppError("File size is too large. Please upload smaller file.", 400);
  }
  return new AppError(err.message, 400);
};

// Error response format for Development
const sendErrorDev = (err, req, res) => {
  logger.error(`[Dev Error Log] Code: ${err.statusCode || 500} - Message: ${err.message}`, err);
  return res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Error response format for Production
const sendErrorProd = (err, req, res) => {
  // 1) Operational, trusted error: send clean message to client
  if (err.isOperational) {
    logger.warn(`[Prod Warn Log] Operational Error: ${err.statusCode} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // 2) Programming or other unknown error: don't leak internals to client
  logger.error("[Prod Error Log] UNEXPECTED SYSTEM BUG:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went very wrong on our server. Please try again later.",
  });
};

// Global centralized middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
    error.message = err.message;
    error.stack = err.stack;

    // Map database & upload specific errors to clear Operational Errors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "MulterError") error = handleMulterError(error);

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;
