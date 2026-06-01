import mongoose from "mongoose";

const onboardingSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Onboarding must belong to an employee!"],
      unique: true,
    },
    tasks: [
      {
        taskKey: { type: String, required: true },
        label: { type: String, required: true },
        completed: { type: Boolean, default: false },
        verifiedByHR: { type: Boolean, default: false },
      },
    ],
    progress: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate progress percentage before saving
onboardingSchema.pre("save", function (next) {
  if (this.tasks.length === 0) {
    this.progress = 0;
    return next();
  }
  const completedTasks = this.tasks.filter((t) => t.completed && t.verifiedByHR).length;
  this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  next();
});

const Onboarding = mongoose.model("Onboarding", onboardingSchema);

export default Onboarding;
