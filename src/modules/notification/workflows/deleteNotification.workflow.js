import AppError from "../../../utils/AppError.js";
import { deleteNotificationForUser, getCompanyIdForUser } from "../services/notification.service.js";

export const deleteNotificationWorkflow = async (user, notificationId) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  // Attempt to soft delete
  try {
    await deleteNotificationForUser(companyId, user.id, notificationId);
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
       throw new AppError("Notification not found or you don't have access.", 404);
    }
    throw error;
  }
};
