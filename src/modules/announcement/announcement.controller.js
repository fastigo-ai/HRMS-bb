import Announcement from "./announcement.model.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

export const createAnnouncement = catchAsync(async (req, res, next) => {
  const { title, content, category, pinned } = req.body;

  if (!title || !content) {
    return next(new AppError("Please provide both announcement title and content!", 400));
  }

  const newAnn = await Announcement.create({
    title,
    content,
    category: category || "General",
    pinned: !!pinned,
    createdBy: req.user.name || "HR Department",
  });

  res.status(201).json({
    status: "success",
    data: {
      announcement: newAnn,
    },
  });
});

export const getAllAnnouncements = catchAsync(async (req, res, next) => {
  // Sort pinned announcements first, then by latest created
  const announcements = await Announcement.find().sort({ pinned: -1, createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: announcements.length,
    data: {
      announcements,
    },
  });
});

export const deleteAnnouncement = catchAsync(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);

  if (!announcement) {
    return next(new AppError("No announcement found with that ID!", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
