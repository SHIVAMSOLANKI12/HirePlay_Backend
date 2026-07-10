import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findHRById } from "../repositories/hr.repository.js";
import HRDTO from "../dto/hr.dto.js";

export const getHRByIdService = async (ownerId, hrId) => {
  // Get authenticated company
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. Only company owners can view HRs.", 404);
  }

  // Fetch HR checking company boundary and deleted status
  const hr = await findHRById(existingCompany.id, hrId);

  if (!hr) {
    throw new AppError("HR not found or belongs to another company.", 404);
  }

  // Return mapped DTO
  return HRDTO.toResponse(hr);
};
