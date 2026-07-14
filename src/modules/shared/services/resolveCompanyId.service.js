import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";

/**
 * Resolves the companyId for a user, handling COMPANY_ADMIN logic.
 * Ensures the returned companyId is valid or throws an error.
 * 
 * @param {Object} user - The authenticated user object.
 * @returns {Promise<string>} - The resolved companyId.
 */
export const resolveCompanyId = async (user) => {
  let companyId = user.companyId;

  // If companyId is missing on the token but the user is an admin, fetch their company
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }

  if (!companyId) {
    throw new AppError("Company not found for the user", 404);
  }

  return companyId;
};
