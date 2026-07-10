import AppError from "../../../utils/AppError.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { findHRByEmail, createHR } from "../repositories/hr.repository.js";
import bcrypt from "bcrypt";
import HRMapper from "../mappers/hr.mapper.js";
import HRDTO from "../dto/hr.dto.js";

export const createHRService = async (ownerId, payload) => {
  // Check if company exists for this owner
  const existingCompany = await findCompanyByOwnerId(ownerId);
  if (!existingCompany) {
    throw new AppError("Company not found. You must create a company first.", 404);
  }

  // Check duplicate HR email
  const existingHR = await findHRByEmail(payload.email);
  if (existingHR) {
    throw new AppError("An HR with this email already exists.", 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(payload.password, 10);

  // Map to db object
  const hrData = HRMapper.toCreateData(payload, existingCompany.id, hashedPassword);

  // Save to DB
  const newHR = await createHR(hrData);

  // Return DTO
  return HRDTO.toResponse(newHR);
};
