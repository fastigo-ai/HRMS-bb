import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A project must have a name!"],
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    headcount: {
      type: Number,
      default: 1,
    },
    budget: {
      type: String,
      default: "₹0.00L",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Delayed", "Completed"],
      default: "Planning",
    },
    efficiency: {
      type: Number,
      default: 90,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
