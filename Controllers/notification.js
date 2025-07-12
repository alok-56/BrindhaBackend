const AppErr = require("../Helper/appError");
const notificationModal = require("../Models/notification");

// Get User Notification
const GetUserNotification = async (req, res, next) => {
  try {
    let userId = req.user;

    const notifications = await notificationModal
      .find({ userId: userId })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      status: true,
      code: 200,
      message: "notification fetched successfully",
      data: notifications,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

const MarkNotificationAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    const updated = await notificationModal.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        status: false,
        code: 404,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      status: true,
      code: 200,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    return next(new AppErr(error.message, 500));
  }
};

module.exports = {
  GetUserNotification,
  MarkNotificationAsRead
};
