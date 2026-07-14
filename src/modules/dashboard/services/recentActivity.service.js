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

import { resolveCompanyId } from "../../shared/services/resolveCompanyId.service.js";

/**
 * Service to fetch recruiter recent activities.
 */
export const getRecruiterRecentActivitiesService = async (user) => {
  const companyId = await resolveCompanyId(user);

  const activities = await getRecruiterActivities(companyId);
  return toRecruiterActivityList(activities);
};
