import AppError from "../../../utils/AppError.js";
import { updateNotificationPreferencesForUser } from "../services/preference.service.js";
import { getCompanyIdForUser } from "../services/notification.service.js";
import { toPreferenceDTO } from "../mappers/preference.mapper.js";

export const updatePreferencesWorkflow = async (user, data) => {
  const companyId = await getCompanyIdForUser(user);
  
  if (!companyId) {
     throw new AppError("No company context found for user.", 403);
  }

  // Sanitize input to only allow expected fields
  const allowedFields = ['emailEnabled', 'inAppEnabled', 'smsEnabled', 'pushEnabled', 'whatsappEnabled', 'marketingEnabled', 'systemEnabled'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = Boolean(data[field]);
    }
  }

  if (Object.keys(updateData).length === 0) {
     throw new AppError("No valid fields provided for update.", 400);
  }

  const preference = await updateNotificationPreferencesForUser(user.id, companyId, updateData);
  return toPreferenceDTO(preference);
};
