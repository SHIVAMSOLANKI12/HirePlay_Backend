import AppError from "../../../utils/AppError.js";
import { getNotificationsForUser, getCompanyIdForUser } from "../services/notification.service.js";
import { toNotificationListDTO } from "../mappers/notification.mapper.js";

export const getNotificationsWorkflow = async (user, filters) => {
  const companyId = await getCompanyIdForUser(user);

  
  if (!companyId) {
     // If no company context is required for candidates, we can adjust, but the schema has companyId as mandatory.
     throw new AppError("No company context found for user.", 403);
  }

  const { total, data, page, limit } = await getNotificationsForUser(companyId, user.id, filters);

  return toNotificationListDTO(data, total, page, limit);
};
