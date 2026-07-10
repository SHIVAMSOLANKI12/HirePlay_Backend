import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findHRById, softDeleteHR } from "../repositories/hr.repository.js";

export const softDeleteHRService = async (ownerId, hrId) => {
  // Get authenticated company
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. Only company owners can delete HRs.", 404);
  }

  // Fetch HR checking company boundary and deleted status
  const hr = await findHRById(existingCompany.id, hrId);

  if (!hr) {
    throw new AppError("HR not found, belongs to another company, or is already deleted.", 404);
  }

  // Soft delete the HR
  await softDeleteHR(hrId);

  return true;
};
