import AppError from "../../../utils/AppError.js";
import { markAllNotificationsAsRead, getCompanyIdForUser } from "../services/notification.service.js";

export const markAllAsReadWorkflow = async (user) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  const result = await markAllNotificationsAsRead(companyId, user.id);

  return result.count; // Number of notifications updated
};
