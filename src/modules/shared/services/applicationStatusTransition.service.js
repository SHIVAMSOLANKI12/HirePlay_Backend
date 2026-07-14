import AppError from "../../../utils/AppError.js";
import { APPLICATION_STATUS_TRANSITIONS, APPLICATION_STATUS } from "../constants/applicationStatus.constants.js";

/**
 * Returns an array of allowed next statuses for a given status.
 */
export const getAllowedTransitions = (currentStatus) => {
  return APPLICATION_STATUS_TRANSITIONS[currentStatus] || [];
};

/**
 * Validates if a transition from currentStatus to requestedStatus is allowed.
 * Throws 409 Conflict if invalid.
 */
export const isTransitionAllowed = (currentStatus, requestedStatus) => {
  // Validate that the requested status is a recognized system status
  if (!Object.values(APPLICATION_STATUS).includes(requestedStatus)) {
    throw new AppError(`Unrecognized application status: ${requestedStatus}`, 400);
  }

  const allowedTransitions = getAllowedTransitions(currentStatus);

  if (!allowedTransitions.includes(requestedStatus)) {
    throw new AppError(
      `Invalid application status transition. Cannot move from ${currentStatus} to ${requestedStatus}. Allowed transitions: ${allowedTransitions.join(", ") || "None"}`,
      409
    );
  }

  return true;
};
