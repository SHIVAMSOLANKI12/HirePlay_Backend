import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findHRById, updateHR } from "../repositories/hr.repository.js";
import HRDTO from "../dto/hr.dto.js";

export const updateHRService = async (ownerId, hrId, payload) => {
  // Get authenticated company
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. Only company owners can update HRs.", 404);
  }

  // Fetch HR checking company boundary
  const hr = await findHRById(existingCompany.id, hrId);
  if (!hr) {
    throw new AppError("HR not found or belongs to another company.", 404);
  }

  // Update HR
  const updatedHR = await updateHR(hrId, payload);

  // Return mapped DTO
  return HRDTO.toResponse(updatedHR);
};
