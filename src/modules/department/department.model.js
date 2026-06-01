import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A department must have a name!"],
      unique: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A department must have a designated manager lead!"],
    },
    budget: {
      type: String,
      default: "₹1.0Cr / yr",
    },
    hiringStatus: {
      type: String,
      default: "Active hiring",
    },
    efficiency: {
      type: Number,
      default: 95,
      min: 0,
      max: 100,
    },
    accentColor: {
      type: String,
      default: "border-l-indigo-600",
    },
    barColor: {
      type: String,
      default: "bg-indigo-600",
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
