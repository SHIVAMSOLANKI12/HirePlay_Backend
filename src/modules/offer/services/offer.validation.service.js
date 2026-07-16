import AppError from "../../../utils/AppError.js";
import prisma from "../../../config/prisma.js";
import { verifyRecruiterJobAccess } from "../../shared/services/verifyRecruiterJobAccess.service.js";
import { findApplicationById } from "../../application/repositories/application.repository.js";
import { existsActiveOffer } from "../repositories/offer.repository.js";
import { getDecisionWorkflow } from "../../interview/workflows/getDecision.workflow.js";

export const validateOfferCreation = async (user, applicationId) => {
  // 1. Check Application
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true }
  });
  
  if (!application || application.deletedAt) {
    throw new AppError("Application not found", 404);
  }

  // 2. Company / Job Ownership Verification
  await verifyRecruiterJobAccess(user, application.jobId);

  // 3. Prevent duplicate offers (Database has @unique on applicationId)
  const existingOffer = await prisma.offer.findUnique({
    where: { applicationId }
  });
  if (existingOffer) {
    if (existingOffer.deletedAt) {
      throw new AppError("A deleted offer already exists for this application. Please restore it or update it instead of creating a new one.", 409);
    }
    throw new AppError("An active offer already exists for this application", 409);
  }

  // 4. Offer Eligibility via Interview Decision
  // We need to fetch the root interview for this application
  const rootInterview = await prisma.interview.findFirst({
    where: {
      applicationId,
      parentInterviewId: null // Root interview
    }
  });

  if (!rootInterview) {
    throw new AppError("Cannot create offer: No interview process found for this application.", 400);
  }

  let decision;
  try {
    decision = await getDecisionWorkflow(user, rootInterview.id);
  } catch (error) {
    throw new AppError("Cannot create offer: Error retrieving interview decision.", 400);
  }

  if (decision.decision !== "SELECTED") {
    throw new AppError(`Cannot create offer: Interview decision is ${decision.decision}, must be SELECTED`, 400);
  }

  if (!decision.eligibleForOffer) {
    throw new AppError("Cannot create offer: Candidate is not eligible based on interview process.", 400);
  }

  return application;
};

export const validateOfferExists = (offer) => {
  if (!offer || offer.deletedAt) {
    throw new AppError("Offer not found", 404);
  }
};

export const validateOfferStatus = (offer, allowedStatuses) => {
  if (!allowedStatuses.includes(offer.status)) {
    throw new AppError(`Offer status is ${offer.status}, expected one of: ${allowedStatuses.join(", ")}`, 400);
  }
};

export const validateOfferNotExpired = (offer) => {
  if (offer.status === "EXPIRED" || new Date() > new Date(offer.validUntil)) {
    throw new AppError("Offer has expired.", 400);
  }
};

export const validateOfferNotRevoked = (offer) => {
  if (offer.status === "REVOKED") {
    throw new AppError("Offer has been revoked.", 400);
  }
};
