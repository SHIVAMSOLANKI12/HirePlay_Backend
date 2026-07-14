/**
 * Transforms a raw Prisma ApplicationActivity object into a standardized API Timeline Event response.
 */
export const toTimelineEvent = (activity) => ({
  id: activity.id,
  action: activity.action,
  oldStatus: activity.oldStatus,
  newStatus: activity.newStatus,
  metadata: activity.metadata,
  createdAt: activity.createdAt,
  performedBy: activity.user
    ? {
        id: activity.user.id,
        name: activity.user.name,
        role: activity.user.role,
      }
    : undefined,
});

/**
 * Utility to map an array of Prisma objects using the Timeline Event mapping function.
 */
export const toTimelineList = (activities) => activities.map(toTimelineEvent);
