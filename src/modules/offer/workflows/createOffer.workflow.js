import prisma from "../../../config/prisma.js";
import { validateOfferCreation } from "../services/offer.validation.service.js";
import { createOffer } from "../repositories/offer.repository.js";
import { toOfferDTO } from "../mappers/offer.mapper.js";

export const createOfferWorkflow = async (user, data) => {
  // 1. Validation & Eligibility
  const application = await validateOfferCreation(user, data.applicationId);

  // 2. Prepare Offer Data
  const offerData = {
    applicationId: data.applicationId,
    companyId: application.job.companyId,
    candidateId: application.candidateId,
    jobId: application.jobId,
    status: "DRAFT",
    jobTitle: data.jobTitle,
    department: data.department,
    employmentType: data.employmentType,
    salary: data.salary,
    currency: data.currency,
    joiningDate: new Date(data.joiningDate),
    location: data.location,
    reportingManager: data.reportingManager,
    notes: data.notes,
    validUntil: new Date(data.validUntil),
    createdById: user.id,
    updatedById: user.id
  };

  // 3. Database Transaction
  const offer = await prisma.$transaction(async (tx) => {
    // We already have job in application
    offerData.companyId = application.job.companyId;

    const newOffer = await createOffer(offerData, tx);

    // 4. Log Activity
    await tx.activityLog.create({
      data: {
        userId: user.id,
        companyId: application.job.companyId,
        applicationId: application.id,
        jobId: application.job.id,
        type: "OFFER_DRAFTED",
        title: "Offer Drafted",
        description: `An offer has been drafted for candidate.`,
        metadata: { offerId: newOffer.id }
      }
    });

    await tx.applicationActivity.create({
      data: {
        applicationId: application.id,
        performedBy: user.id,
        action: "OFFER_DRAFTED",
        metadata: { offerId: newOffer.id }
      }
    });

    return newOffer;
  });

  return toOfferDTO(offer);
};
