import { getNotificationsWorkflow } from "../workflows/getNotifications.workflow.js";
import { getNotificationByIdWorkflow } from "../workflows/getNotificationById.workflow.js";
import { markAsReadWorkflow } from "../workflows/markAsRead.workflow.js";

export const getNotifications = async (req, res, next) => {
  try {
    const filters = {
      isRead: req.query.isRead,
      type: req.query.type,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const notifications = await getNotificationsWorkflow(req.user, filters);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await getNotificationByIdWorkflow(req.user, notificationId);
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await markAsReadWorkflow(req.user, notificationId);
    
    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: notification
    });
  } catch (error) {
    next(error);
  }
};
