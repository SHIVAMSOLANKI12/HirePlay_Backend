import { getDeliveryStatusById } from "../repositories/delivery.repository.js";
import AppError from "../../../utils/AppError.js";

export const fetchDeliveryStatus = async (notificationId, userId, companyId) => {
  const delivery = await getDeliveryStatusById(notificationId, userId, companyId);
  
  if (!delivery) {
    throw new AppError("Notification not found", 404);
  }
  
  return delivery;
};
