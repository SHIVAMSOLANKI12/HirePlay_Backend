import { DocumentTemplateRepository } from "../repositories/documentTemplate.repository.js";
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

export const createDocumentTemplateWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  if (!data.documentType || !data.title) {
    throw new AppError("documentType and title are required for DocumentTemplate.", 400);
  }

  const existing = await DocumentTemplateRepository.findByType(companyId, data.documentType);
  if (existing) {
    throw new AppError(`Document template for type ${data.documentType} already exists for this company.`, 409);
  }

  return await DocumentTemplateRepository.create({
    ...data,
    companyId
  });
};

export const getDocumentTemplatesWorkflow = async (user) => {
  const companyId = await getCompanyId(user);
  return await DocumentTemplateRepository.findByCompanyId(companyId);
};
