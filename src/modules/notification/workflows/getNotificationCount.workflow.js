import AppError from "../../../utils/AppError.js";
import { getNotificationCountForUser, getCompanyIdForUser } from "../services/notification.service.js";
import { toNotificationCountDTO } from "../mappers/notification.mapper.js";

export const getNotificationCountWorkflow = async (user) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  const countData = await getNotificationCountForUser(companyId, user.id);

  return toNotificationCountDTO(countData);
};
