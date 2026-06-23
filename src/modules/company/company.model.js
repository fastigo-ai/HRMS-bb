import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required!"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Company address is required!"],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, "Latitude is required!"],
    },
    longitude: {
      type: Number,
      required: [true, "Longitude is required!"],
    },
    radius: {
      type: Number,
      default: 200, // 200 meters allowed check-in radius
    },
    saturdayRule: {
      type: String,
      enum: ["5-day", "6-day", "2nd-4th-off"],
      default: "5-day",
    },
   
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
