import prisma from "../../../config/prisma.js";

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
