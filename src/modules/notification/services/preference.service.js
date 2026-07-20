import { getPreferenceByUserId, createDefaultPreference, updatePreferenceByUserId } from "../repositories/preference.repository.js";

export const getNotificationPreferencesForUser = async (userId, companyId) => {
  let preference = await getPreferenceByUserId(userId, companyId);
  
  if (!preference) {
    preference = await createDefaultPreference(userId, companyId);
  }
  
  return preference;
};

export const updateNotificationPreferencesForUser = async (userId, companyId, data) => {
  // Ensure preference exists
  await getNotificationPreferencesForUser(userId, companyId);
  
  return updatePreferenceByUserId(userId, companyId, data);
};
