import prisma from "../../../config/prisma.js";
import { updateApplicationStatusWorkflow } from "./updateApplicationStatus.workflow.js";

export const bulkUpdateApplicationStatusWorkflow = async (user, applicationIds, requestedStatus, metadata = null) => {
  // 1. Remove duplicate IDs
  const uniqueApplicationIds = [...new Set(applicationIds)];

  // 2. Start a single Prisma Transaction
  return await prisma.$transaction(async (tx) => {
    const updatedApplications = [];

    // 3. Execute individual workflows sequentially passing the transaction
    for (const applicationId of uniqueApplicationIds) {
      const updatedApp = await updateApplicationStatusWorkflow(
        user,
        applicationId,
        requestedStatus,
        metadata,
        tx
      );
      updatedApplications.push(updatedApp);
    }

    return updatedApplications;
  });
};
