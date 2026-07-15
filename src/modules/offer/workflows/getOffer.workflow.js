import AppError from "../../../utils/AppError.js";
import { findOfferById } from "../repositories/offer.repository.js";
import { toOfferDTO } from "../mappers/offer.mapper.js";
import { getDecisionWorkflow } from "../../interview/workflows/getDecision.workflow.js";
import prisma from "../../../config/prisma.js";

export const getOfferWorkflow = async (user, offerId) => {
  let offer;
  
  if (user.role === "COMPANY_ADMIN" || user.role === "HR") {
    // If recruiter, check company access
    // For simplicity, we just fetch offer and let verifyRecruiterJobAccess handle job check?
    // Let's just fetch it, and verify job access
    offer = await findOfferById(offerId);
    if (!offer) {
      throw new AppError("Offer not found", 404);
    }
    
    // Check if recruiter has access to this job's company
    // Usually user.company[0].id or similar.
    // For now, let's fetch user's company and match.
    // We can use verifyRecruiterJobAccess(user, offer.jobId) to be consistent.
    const { verifyRecruiterJobAccess } = await import("../../shared/services/verifyRecruiterJobAccess.service.js");
    await verifyRecruiterJobAccess(user, offer.jobId);
  } else {
    throw new AppError("Access denied", 403);
  }

  // Fetch the interview decision for completeness
  const rootInterview = await prisma.interview.findFirst({
    where: {
      applicationId: offer.applicationId,
      parentInterviewId: null
    }
  });

  if (rootInterview) {
    try {
      const decision = await getDecisionWorkflow(user, rootInterview.id);
      offer.interviewDecision = decision;
    } catch (e) {
      // Ignore
    }
  }

  return toOfferDTO(offer);
};
