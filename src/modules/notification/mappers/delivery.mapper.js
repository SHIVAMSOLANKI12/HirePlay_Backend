export const toDeliveryDTO = (delivery) => {
  if (!delivery) return null;
  return {
    id: delivery.id,
    status: delivery.status,
    channel: delivery.channel,
    retryCount: delivery.retryCount,
    failureReason: delivery.failureReason,
    providerResponse: delivery.providerResponse,
    provider: delivery.provider,
    timeline: {
      queuedAt: delivery.queuedAt,
      processingAt: delivery.processingAt,
      sentAt: delivery.sentAt,
      failedAt: delivery.failedAt,
      lastRetryAt: delivery.lastRetryAt
    }
  };
};
