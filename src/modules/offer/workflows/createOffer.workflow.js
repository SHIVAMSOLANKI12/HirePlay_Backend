import prisma from "../../../config/prisma.js";
import { validateOfferCreation } from "../services/offer.validation.service.js";
import { createOffer } from "../repositories/offer.repository.js";
import { toOfferDTO } from "../mappers/offer.mapper.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";

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

    eventEngine.emit(ACTIVITY_EVENTS.OFFER_CREATED, {
      userId: user.id,
      companyId: application.job.companyId,
      entityId: newOffer.id,
      performedByRole: user.role,
      newValue: { title: "Offer Drafted", description: `An offer has been drafted for candidate.` },
      metadata: { applicationId: application.id, jobId: application.job.id }
    });

    await tx.applicationActivity.create({
      data: {
        applicationId: application.id,
        performedBy: user.id,
        action: "OFFER_DRAFTED",
        metadata: { offerId: newOffer.id }
      }
    });

    await logOfferTimeline(
      newOffer.id,
      "CREATED",
      "Offer Draft Created",
      "Offer draft was created successfully.",
      user,
      tx
    );

    return newOffer;
  });

  const { publishNotificationEvent } = await import("../../notification/publishers/notification.publisher.js");
  const { NOTIFICATION_EVENTS } = await import("../../notification/constants/notification.events.js");

  publishNotificationEvent(NOTIFICATION_EVENTS.OFFER_CREATED, {
    companyId: offer.companyId,
    userId: user.id, // Internal notification to the creator or admins
    type: "OFFER",
    channel: "EMAIL",
    title: "Offer Draft Created",
    message: `An offer has been drafted for ${application.candidate?.firstName || 'Candidate'}.`,
    metadata: { offerId: offer.id },
    eventName: NOTIFICATION_EVENTS.OFFER_CREATED,
    CandidateName: application.candidate?.firstName || "Candidate",
    JobTitle: offer.jobTitle,
    OfferSalary: `${offer.currency} ${offer.salary}`,
    OfferJoiningDate: new Date(offer.joiningDate).toLocaleDateString(),
  });

  return toOfferDTO(offer);
};
