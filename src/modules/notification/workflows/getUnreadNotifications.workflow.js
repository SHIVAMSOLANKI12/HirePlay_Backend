import AppError from "../../../utils/AppError.js";
import { getUnreadNotificationsForUser, getCompanyIdForUser } from "../services/notification.service.js";
import { toNotificationListDTO } from "../mappers/notification.mapper.js";

export const getUnreadNotificationsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  const { total, data, page, limit } = await getUnreadNotificationsForUser(companyId, user.id, filters);

  return toNotificationListDTO(data, total, page, limit);
};
