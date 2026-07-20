import AppError from "../../../utils/AppError.js";
import { getNotificationPreferencesForUser } from "../services/preference.service.js";
import { getCompanyIdForUser } from "../services/notification.service.js";
import { toPreferenceDTO } from "../mappers/preference.mapper.js";

export const getPreferencesWorkflow = async (user) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  const preference = await getNotificationPreferencesForUser(user.id, companyId);
  return toPreferenceDTO(preference);
};
