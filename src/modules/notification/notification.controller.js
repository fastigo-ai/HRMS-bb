import Notification from "./notification.model.js";
import catchAsync from "../../utils/catchAsync.js";

// Retrieve all notifications for the authenticated user
export const getMyNotifications = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Notifications']
  const notifications = await Notification.find({ recipient: req.user.id }).sort("-createdAt");
  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
    },
  });
});
// Mark all notifications as read for the authenticated user
export const markAllNotificationsRead = catchAsync(async (req, res, next) => {
  // #swagger.tags = ['Notifications']
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  const updatedNotifications = await Notification.find({ recipient: req.user.id }).sort("-createdAt");
  res.status(200).json({
    status: "success",
    data: {
      notifications: updatedNotifications,
    },
  });
});
