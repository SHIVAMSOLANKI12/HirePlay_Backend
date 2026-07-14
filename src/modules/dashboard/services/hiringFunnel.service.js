import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { getCompanyApplicationStatistics } from "../repositories/dashboard.repository.js";
import { toHiringFunnel } from "../mappers/dashboard.mapper.js";

import { resolveCompanyId } from "../../shared/services/resolveCompanyId.service.js";

/**
 * Service to calculate the Hiring Funnel Analytics for a company
 */
export const getHiringFunnelService = async (user) => {
  const companyId = await resolveCompanyId(user);

  // Reuse the highly optimized repository function
  const appStats = await getCompanyApplicationStatistics(companyId);

  return toHiringFunnel(appStats);
};
