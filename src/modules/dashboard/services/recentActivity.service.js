import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { getCandidateActivities, getRecruiterActivities } from "../repositories/dashboard.repository.js";
import { toCandidateActivityList, toRecruiterActivityList } from "../mappers/dashboard.mapper.js";

/**
 * Service to fetch candidate recent activities.
 */
export const getCandidateRecentActivitiesService = async (user) => {
  const activities = await getCandidateActivities(user.id);
  return toCandidateActivityList(activities);
};

/**
 * Service to fetch recruiter recent activities.
 */
export const getRecruiterRecentActivitiesService = async (user) => {
  let companyId = user.companyId;

  // Resolve companyId for COMPANY_ADMIN
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found for the user", 404);
  }

  const activities = await getRecruiterActivities(companyId);
  return toRecruiterActivityList(activities);
};
