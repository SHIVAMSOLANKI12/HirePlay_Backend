import { createActivity } from "../repositories/activity.repository.js";
import AppError from "../../../utils/AppError.js";

import prisma from "../../../config/prisma.js";

/**
 * Reusable service to log application activities globally across the ATS.
 * It strictly creates records without throwing blocking errors to the caller 
 * unless validation rules are completely missing (e.g., missing critical IDs).
 */
export const logApplicationActivity = async (
  {
    applicationId,
    performedBy,
    action,
    oldStatus = null,
    newStatus = null,
    metadata = null,
  },
  tx = prisma
) => {
  try {
    if (!applicationId || !performedBy || !action) {
      throw new AppError("applicationId, performedBy, and action are required to log activity.", 400);
    }

    const activity = await createActivity({
      applicationId,
      performedBy,
      action,
      oldStatus,
      newStatus,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    }, tx);

    return activity;
  } catch (error) {
    // In a highly resilient system, we might want to pipe this to an external 
    // error tracking service (Sentry, DataDog, etc.) without crashing the parent transaction.
    console.error("Failed to log Application Activity:", error);
    // We intentionally swallow or re-throw based on strictness.
    // For now, re-throwing so the API catches it and 500s.
    throw error;
  }
};
