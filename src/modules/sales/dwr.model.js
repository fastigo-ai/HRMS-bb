import mongoose from "mongoose";

const dwrSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A DWR report must be mapped to an employee!"],
    },
    summary: {
      type: String,
      required: [true, "Daily work summary is required!"],
    },
    plan: {
      type: String,
      required: [true, "Tomorrow's action plan is required!"],
    },
    blockers: {
      type: String,
      default: "None",
    },
  },
  {
    timestamps: true,
  }
);

const Dwr = mongoose.model("Dwr", dwrSchema);

export default Dwr;
