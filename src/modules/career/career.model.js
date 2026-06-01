import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Career progression must belong to an employee!"],
    },
    type: {
      type: String,
      enum: ["Transfer", "Promotion"],
      required: [true, "Career progression type is required!"],
    },
    previousDepartment: {
      type: String,
    },
    newDepartment: {
      type: String,
    },
    previousPosition: {
      type: String,
    },
    newPosition: {
      type: String,
    },
    previousSalary: {
      type: Number,
    },
    newSalary: {
      type: Number,
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required!"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Career = mongoose.model("Career", careerSchema);

export default Career;
