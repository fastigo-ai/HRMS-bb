import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required!"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Announcement content is required!"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["General", "Policy", "Event", "Alert"],
      default: "General",
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: String,
      default: "HR Department",
    },
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
