import { InterviewTemplateRepository } from "../repositories/interviewTemplate.repository.js";
import { InterviewTemplateMapper } from "../mappers/interviewTemplate.mapper.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
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

export const createInterviewTemplateWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  const template = await InterviewTemplateRepository.create({
    ...data,
    companyId,
    createdById: user.id
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: template.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { title: template.title },
    performedByRole: user.role
  });

  return InterviewTemplateMapper.toDto(template);
};

export const getInterviewTemplatesWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await InterviewTemplateRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(InterviewTemplateMapper.toDto)
  };
};

export const getInterviewTemplateByIdWorkflow = async (templateId, user) => {
  const companyId = await getCompanyId(user);

  const template = await InterviewTemplateRepository.findById(templateId, companyId);
  if (!template) throw new AppError("Interview template not found", 404);

  return InterviewTemplateMapper.toDto(template);
};

export const updateInterviewTemplateWorkflow = async (templateId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewTemplateRepository.findById(templateId, companyId);
  if (!existing) throw new AppError("Interview template not found", 404);

  await InterviewTemplateRepository.update(templateId, companyId, updateData);
  const updated = await InterviewTemplateRepository.findById(templateId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: templateId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { templateId },
    performedByRole: user.role
  });

  return InterviewTemplateMapper.toDto(updated);
};

export const deleteInterviewTemplateWorkflow = async (templateId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewTemplateRepository.findById(templateId, companyId);
  if (!existing) throw new AppError("Interview template not found", 404);

  await InterviewTemplateRepository.softDelete(templateId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: templateId,
    action: ACTIVITY_ACTIONS.DELETE,
    metadata: { templateId },
    performedByRole: user.role
  });

  return { message: "Interview template soft deleted successfully" };
};

export const duplicateInterviewTemplateWorkflow = async (templateId, user) => {
  const companyId = await getCompanyId(user);

  const original = await InterviewTemplateRepository.findById(templateId, companyId);
  if (!original) throw new AppError("Original interview template not found", 404);

  const duplicated = await InterviewTemplateRepository.create({
    companyId,
    createdById: user.id,
    title: `${original.title} (Copy)`,
    description: original.description,
    status: "DRAFT",
    isDefault: false,
    rounds: original.rounds ? original.rounds.map(r => ({
      roundName: r.roundName,
      roundType: r.roundType,
      sequence: r.sequence,
      expectedDurationMinutes: r.expectedDurationMinutes,
      questionCount: r.questionCount,
      passingScore: r.passingScore
    })) : [],
    criteria: original.criteria ? original.criteria.map(c => ({
      name: c.name,
      description: c.description,
      weight: c.weight,
      maxScore: c.maxScore
    })) : [],
    questionIds: original.templateQuestions ? original.templateQuestions.map(tq => tq.questionId) : []
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: duplicated.id,
    action: ACTIVITY_ACTIONS.GENERATE,
    metadata: { originalTemplateId: templateId, duplicatedTemplateId: duplicated.id },
    performedByRole: user.role
  });

  return InterviewTemplateMapper.toDto(duplicated);
};
