import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Configs
import logger from "./src/config/logger.js";
import connectDB from "./src/config/db.js";

// Middlewares
import loggerMiddleware from "./src/middlewares/loggerMiddleware.js";
import errorHandler from "./src/middlewares/errorHandler.js";

// Utilities
import AppError from "./src/utils/AppError.js";

// Routes
import employeeRoutes from "./src/modules/employee/employee.route.js";

// Handle uncaught exceptions globally before any execution
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Serve Static Uploaded Files
app.use("/uploads", express.static("uploads"));

// Modular Routes
app.use("/api/employees", employeeRoutes);

// Catch undefined routes and throw AppError
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
});

// Centralized Universal Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`HRM Server initialized and listening on port ${PORT}`);
});

// Handle unhandled promise rejections globally
process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down gracefully...", err);
  server.close(() => {
    process.exit(1);
  });
});