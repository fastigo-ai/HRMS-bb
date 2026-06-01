import mongoose from "mongoose";
import dotenv from "dotenv";
import Attendance from "./src/modules/attendance/attendance.model.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");
  
  const records = await Attendance.find({});
  console.log("All Attendance Records in DB:");
  console.log(JSON.stringify(records, null, 2));
  
  await mongoose.disconnect();
};

run().catch(console.error);