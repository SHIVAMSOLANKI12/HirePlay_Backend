import prisma from "../../../config/prisma.js";
import { logOfferTimeline } from "../services/offerAudit.service.js";

export const createOffer = async (data, tx = prisma) => {
  return await tx.offer.create({
    data,
  });
};

export const findOfferById = async (offerId, companyId = null, tx = prisma) => {
  const where = { id: offerId, deletedAt: null };
  if (companyId) {
    where.companyId = companyId;
  }
  
  return await tx.offer.findFirst({
    where,
    include: {
      application: true,
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      },
      job: {
        select: {
          id: true,
          title: true,
          department: true,
        }
      }
    }
  });
};

export const findOffers = async (where, skip, take, tx = prisma) => {
  return await tx.offer.findMany({
    where: { ...where, deletedAt: null },
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      candidate: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      job: {
        select: {
          id: true,
          title: true,
        }
      }
    }
  });
};

export const updateOffer = async (offerId, data, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data,
  });
};

export const deleteOffer = async (offerId, deletedById, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      deletedAt: new Date(),
      updatedById: deletedById
    }
  });
};

export const countOffers = async (where, tx = prisma) => {
  return await tx.offer.count({
    where: { ...where, deletedAt: null }
  });
};

export const existsActiveOffer = async (applicationId, tx = prisma) => {
  const offer = await tx.offer.findFirst({
    where: {
      applicationId,
      deletedAt: null,
      status: {
        notIn: ["EXPIRED", "REVOKED", "REJECTED"]
      }
    }
  });
  return !!offer;
};

export const approveOffer = async (offerId, userId, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "APPROVED",
      approvedById: userId,
      approvedAt: new Date(),
    }
  });
};

export const sendOffer = async (offerId, userId, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "SENT",
      sentById: userId,
      sentAt: new Date(),
    }
  });
};

export const findWorkflow = async (offerId, tx = prisma) => {
  return await tx.offer.findFirst({
    where: { id: offerId, deletedAt: null },
    select: {
      id: true,
      status: true,
      createdAt: true,
      approvedAt: true,
      sentAt: true,
      jobId: true,
      approvedBy: {
        select: { id: true, name: true, email: true }
      },
      sentBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

export const isOfferReadyToSend = async (offerId, tx = prisma) => {
  const offer = await tx.offer.findFirst({
    where: { id: offerId, deletedAt: null },
    select: { status: true }
  });
  return offer?.status === "APPROVED";
};

export const getCandidateOffers = async (candidateId, tx = prisma) => {
  return await tx.offer.findMany({
    where: { 
      candidateId, 
      deletedAt: null,
      status: {
        notIn: ["DRAFT", "APPROVED"] // Candidate only sees SENT, ACCEPTED, REJECTED, EXPIRED, REVOKED
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      company: { select: { id: true, name: true, logo: true } },
      job: { select: { id: true, title: true, department: true } }
    }
  });
};

export const getCandidateOffer = async (candidateId, offerId, tx = prisma) => {
  return await tx.offer.findFirst({
    where: {
      id: offerId,
      candidateId,
      deletedAt: null,
      status: {
        notIn: ["DRAFT", "APPROVED"]
      }
    },
    include: {
      company: { select: { id: true, name: true, logo: true } },
      job: { select: { id: true, title: true, department: true } }
    }
  });
};

export const acceptOffer = async (offerId, message, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date(),
      candidateResponseMessage: message
    }
  });
};

export const rejectOffer = async (offerId, reason, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectionReason: reason
    }
  });
};

export const revokeOffer = async (offerId, userId, reason, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
      revokedById: userId,
      revocationReason: reason
    }
  });
};

export const markOfferExpired = async (offerId, tx = prisma) => {
  return await tx.offer.update({
    where: { id: offerId },
    data: {
      status: "EXPIRED",
      expiredAt: new Date()
    }
  });
};

export const checkAndMarkOfferExpired = async (offer, tx = prisma) => {
  if (!offer || ["ACCEPTED", "REJECTED", "REVOKED", "EXPIRED"].includes(offer.status)) {
    return offer;
  }
  
  if (offer.validUntil < new Date()) {
    const expiredOffer = await markOfferExpired(offer.id, tx);
    
    // Log activity
    await tx.activityLog.create({
      data: {
        userId: offer.createdById, // System action, but attributing to creator
        companyId: offer.companyId,
        applicationId: offer.applicationId,
        jobId: offer.jobId,
        type: "OFFER_EXPIRED",
        title: "Offer Expired",
        description: `Offer has automatically expired.`,
        metadata: { offerId: offer.id }
      }
    });

    await logOfferTimeline(
      offer.id,
      "EXPIRED",
      "Offer Expired",
      "Offer has automatically expired.",
      { id: offer.createdById, role: "SYSTEM" }, // Dummy user for system action
      tx
    );
    
    return { ...offer, status: "EXPIRED", expiredAt: expiredOffer.expiredAt };
  }
  
  return offer;
};
