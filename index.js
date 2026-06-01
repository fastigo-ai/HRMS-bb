import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Configs
import logger from "./src/config/logger.js";
import connectDB from "./src/config/db.js";

// Middlewares
import loggerMiddleware from "./src/middlewares/loggerMiddleware.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import cookieParser from "cookie-parser";

// Utilities
import AppError from "./src/utils/AppError.js";

// Routes
import authRoutes from "./src/modules/auth/auth.route.js";
import categoryRoutes from "./src/modules/category/category.route.js";
import employeeRoutes from "./src/modules/employee/employee.route.js";
import leaveRoutes from "./src/modules/leave/leave.route.js";
import attendanceRoutes from "./src/modules/attendance/attendance.route.js";
import taskRoutes from "./src/modules/task/task.route.js";
import projectRoutes from "./src/modules/project/project.route.js";
import timesheetRoutes from "./src/modules/timesheet/timesheet.route.js";
import notificationRoutes from "./src/modules/notification/notification.route.js";
import payrollRoutes from "./src/modules/payroll/payroll.route.js";
import departmentRoutes from "./src/modules/department/department.route.js";
import salesRoutes from "./src/modules/sales/sales.route.js";
import swaggerRouter from "./swagger-endpoints.js";

// New modular routes
import holidayRoutes from "./src/modules/holiday/holiday.route.js";
import wfhRoutes from "./src/modules/wfh/wfh.route.js";
import overtimeRoutes from "./src/modules/overtime/overtime.route.js";
import resignationRoutes from "./src/modules/resignation/resignation.route.js";
import onboardingRoutes from "./src/modules/onboarding/onboarding.route.js";
import documentRoutes from "./src/modules/employee/document.route.js";
import regularizationRoutes from "./src/modules/attendance/regularization.route.js";
import careerRoutes from "./src/modules/career/career.route.js";
import announcementRoutes from "./src/modules/announcement/announcement.route.js";

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
app.use(
  cors({
    origin: ["http://localhost:5173", "https://admin.fastigo.co"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.get("/favicon.ico", (req, res) => res.status(204).end());

// Serve Static Uploaded Files
app.use("/uploads", express.static("uploads"));

// Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/timesheets", timesheetRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api-docs", swaggerRouter);

// New Modular Routes Mount
app.use("/api/holidays", holidayRoutes);
app.use("/api/wfh", wfhRoutes);
app.use("/api/overtime", overtimeRoutes);
app.use("/api/resignations", resignationRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/regularizations", regularizationRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/announcements", announcementRoutes);

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