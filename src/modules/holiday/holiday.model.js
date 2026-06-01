import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Holiday date is required!"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Holiday name is required!"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday = mongoose.model("Holiday", holidaySchema);

export default Holiday;
