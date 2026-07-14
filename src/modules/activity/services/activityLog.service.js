import prisma from "../../../config/prisma.js";

/**
 * Creates a generic ActivityLog record.
 * Supports passing a transaction (tx) to ensure atomicity.
 */
export const createActivityLog = async (data, tx = prisma) => {
  return tx.activityLog.create({
    data: {
      userId: data.userId,
      companyId: data.companyId,
      applicationId: data.applicationId,
      jobId: data.jobId,
      type: data.type,
      title: data.title,
      description: data.description,
      metadata: data.metadata,
    },
  });
};
