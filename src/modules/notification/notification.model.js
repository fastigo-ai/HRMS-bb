import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A notification must have a recipient!"],
    },
    title: {
      type: String,
      required: [true, "A notification must have a title!"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "A notification must have a message!"],
      trim: true,
    },
    category: {
      type: String,
      default: "task",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
