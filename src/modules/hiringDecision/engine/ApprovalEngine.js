import AppError from "../../../utils/AppError.js";

export class ApprovalEngine {
  /**
   * Evaluates state machine transitions for Hiring Decisions.
   * @param {string} currentStatus 
   * @param {string} action ("SUBMIT", "APPROVE", "REJECT", "ESCALATE", "REOPEN")
   * @param {Object} approvalState { currentLevel, totalLevels }
   * @returns {{ nextStatus: string, isOfferReady: boolean }}
   */
  static processStateTransition(currentStatus, action, approvalState = { currentLevel: 1, totalLevels: 1 }) {
    switch (action) {
      case "SUBMIT":
        if (currentStatus !== "PENDING" && currentStatus !== "ON_HOLD") {
          throw new AppError(`Cannot submit decision in ${currentStatus} status.`, 400);
        }
        return { nextStatus: "UNDER_REVIEW", isOfferReady: false };

      case "APPROVE":
        if (currentStatus !== "UNDER_REVIEW" && currentStatus !== "ESCALATED") {
          throw new AppError(`Cannot approve decision in ${currentStatus} status.`, 400);
        }
        const isFinalLevel = approvalState.currentLevel >= approvalState.totalLevels;
        const nextStatus = isFinalLevel ? "OFFER_READY" : "UNDER_REVIEW";
        return { nextStatus, isOfferReady: isFinalLevel };

      case "REJECT":
        if (currentStatus !== "UNDER_REVIEW" && currentStatus !== "ESCALATED" && currentStatus !== "PENDING") {
          throw new AppError(`Cannot reject decision in ${currentStatus} status.`, 400);
        }
        return { nextStatus: "REJECTED", isOfferReady: false };

      case "ESCALATE":
        if (currentStatus !== "UNDER_REVIEW" && currentStatus !== "PENDING") {
          throw new AppError(`Cannot escalate decision in ${currentStatus} status.`, 400);
        }
        return { nextStatus: "ESCALATED", isOfferReady: false };

      case "REOPEN":
        if (currentStatus !== "REJECTED" && currentStatus !== "CLOSED" && currentStatus !== "ON_HOLD") {
          throw new AppError(`Cannot reopen decision in ${currentStatus} status.`, 400);
        }
        return { nextStatus: "PENDING", isOfferReady: false };

      default:
        throw new AppError(`Invalid decision action: ${action}`, 400);
    }
  }
}
