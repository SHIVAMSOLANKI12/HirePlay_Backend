import prisma from "../../../config/prisma.js";

export const getDeliveryStatusById = async (notificationId, userId, companyId) => {
  return prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
      companyId,
      deletedAt: null
    },
    select: {
      id: true,
      status: true,
      retryCount: true,
      failureReason: true,
      providerResponse: true,
      queuedAt: true,
      processingAt: true,
      sentAt: true,
      failedAt: true,
      lastRetryAt: true,
      provider: true,
      channel: true
    }
  });
};
