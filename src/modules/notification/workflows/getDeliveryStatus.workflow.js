import { fetchDeliveryStatus } from "../services/delivery.service.js";
import { toDeliveryDTO } from "../mappers/delivery.mapper.js";

export const executeGetDeliveryStatus = async (notificationId, userId, companyId) => {
  const delivery = await fetchDeliveryStatus(notificationId, userId, companyId);
  return toDeliveryDTO(delivery);
};
