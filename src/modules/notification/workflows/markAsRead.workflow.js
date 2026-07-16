import AppError from "../../../utils/AppError.js";
import { getNotificationDetail, markNotificationAsRead, getCompanyIdForUser } from "../services/notification.service.js";
import { toNotificationDTO } from "../mappers/notification.mapper.js";

export const markAsReadWorkflow = async (user, notificationId) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  // Ensure notification belongs to user
  const notification = await getNotificationDetail(companyId, user.id, notificationId);
  if (!notification) {
    throw new AppError("Notification not found.", 404);
  }

  const updatedNotification = await markNotificationAsRead(companyId, user.id, notificationId);

  return toNotificationDTO(updatedNotification);
};
