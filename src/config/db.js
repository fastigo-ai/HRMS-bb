import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hrm-saas";
    logger.info(`Attempting database connection...`);

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB database connection established successfully.");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB database connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB database connection disconnected.");
    });

    await mongoose.connect(connUri);
  } catch (error) {
    logger.error(`Database initialization error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
