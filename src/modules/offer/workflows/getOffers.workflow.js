import AppError from "../../../utils/AppError.js";
import { findOffers, countOffers } from "../repositories/offer.repository.js";
import { toOfferListDTO } from "../mappers/offer.mapper.js";
import prisma from "../../../config/prisma.js";

export const getOffersWorkflow = async (user, filters = {}) => {
  if (user.role !== "COMPANY_ADMIN" && user.role !== "HR") {
    throw new AppError("Access denied", 403);
  }

  // Find company of the user
  const myCompany = await prisma.company.findFirst({
    where: {
      OR: [
        { ownerId: user.id },
        { hrs: { some: { email: user.email } } } // Adjust based on your schema
      ]
    }
  });

  if (!myCompany) {
    throw new AppError("Company not found", 404);
  }

  const where = { companyId: myCompany.id };
  if (filters.status) where.status = filters.status;
  if (filters.jobId) where.jobId = filters.jobId;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [offers, total] = await Promise.all([
    findOffers(where, skip, limit),
    countOffers(where)
  ]);

  return {
    offers: toOfferListDTO(offers),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
