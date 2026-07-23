import { EmployeeProfileRepository } from "../repositories/employeeProfile.repository.js";
import { EmployeeProfileMapper } from "../mappers/employeeProfile.mapper.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import AppError from "../../../utils/AppError.js";

const getCompanyId = async (user) => {
  let companyId = user.companyId;
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) companyId = existingCompany.id;
  }
  if (!companyId) throw new AppError("Company not found", 404);
  return companyId;
};

export const getEmployeesWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await EmployeeProfileRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(EmployeeProfileMapper.toDto)
  };
};

export const getEmployeeByIdWorkflow = async (employeeId, user) => {
  const companyId = await getCompanyId(user);

  const profile = await EmployeeProfileRepository.findById(employeeId, companyId);
  if (!profile) throw new AppError("Employee profile not found", 404);

  return EmployeeProfileMapper.toDto(profile);
};
