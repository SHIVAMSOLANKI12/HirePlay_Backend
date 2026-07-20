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

export const getUnreadNotifications = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      channel: req.query.channel,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      sort: req.query.sort,
      page: req.query.page,
      limit: req.query.limit
    };
    
    const { getUnreadNotificationsWorkflow } = await import("../workflows/getUnreadNotifications.workflow.js");
    const notifications = await getUnreadNotificationsWorkflow(req.user, filters);
    
    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationCount = async (req, res, next) => {
  try {
    const { getNotificationCountWorkflow } = await import("../workflows/getNotificationCount.workflow.js");
    const countData = await getNotificationCountWorkflow(req.user);
    
    res.status(200).json({
      success: true,
      data: countData
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const { markAllAsReadWorkflow } = await import("../workflows/markAllAsRead.workflow.js");
    const count = await markAllAsReadWorkflow(req.user);
    
    res.status(200).json({
      success: true,
      message: `${count} notifications marked as read`,
      data: { count }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const { deleteNotificationWorkflow } = await import("../workflows/deleteNotification.workflow.js");
    
    await deleteNotificationWorkflow(req.user, notificationId);
    
    res.status(200).json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
