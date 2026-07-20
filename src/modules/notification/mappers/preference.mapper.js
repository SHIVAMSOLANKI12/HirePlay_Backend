export const toPreferenceDTO = (preference) => {
  if (!preference) return null;
  return {
    id: preference.id,
    emailEnabled: preference.emailEnabled,
    inAppEnabled: preference.inAppEnabled,
    smsEnabled: preference.smsEnabled,
    pushEnabled: preference.pushEnabled,
    whatsappEnabled: preference.whatsappEnabled,
    marketingEnabled: preference.marketingEnabled,
    systemEnabled: preference.systemEnabled,
    updatedAt: preference.updatedAt
  };
};
