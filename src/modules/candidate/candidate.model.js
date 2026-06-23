import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required!"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required!"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "Fresher",
    },
    skills: {
      type: [String],
      default: [],
    },
    currentCompany: {
      type: String,
      default: "",
    },
    noticePeriod: {
      type: String,
      default: "Immediate",
    },
    expectedSalary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

const recruitmentSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: "openPositions" },
  value: { type: Number, default: 8 }
});

export const RecruitmentSetting = mongoose.model("RecruitmentSetting", recruitmentSettingSchema);

export default Candidate;
