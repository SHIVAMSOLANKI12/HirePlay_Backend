import { QuestionBankRepository } from "../repositories/questionBank.repository.js";
import { QuestionBankMapper } from "../mappers/questionBank.mapper.js";
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

export const createQuestionWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  const question = await QuestionBankRepository.create({
    ...data,
    companyId
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: question.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { title: question.title, type: question.type },
    performedByRole: user.role
  });

  return QuestionBankMapper.toDto(question);
};

export const getQuestionsWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await QuestionBankRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(QuestionBankMapper.toDto)
  };
};

export const updateQuestionWorkflow = async (questionId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await QuestionBankRepository.findById(questionId, companyId);
  if (!existing) throw new AppError("Question not found", 404);

  await QuestionBankRepository.update(questionId, companyId, updateData);
  const updated = await QuestionBankRepository.findById(questionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: questionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { questionId },
    performedByRole: user.role
  });

  return QuestionBankMapper.toDto(updated);
};

export const deleteQuestionWorkflow = async (questionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await QuestionBankRepository.findById(questionId, companyId);
  if (!existing) throw new AppError("Question not found", 404);

  await QuestionBankRepository.softDelete(questionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: questionId,
    action: ACTIVITY_ACTIONS.DELETE,
    metadata: { questionId },
    performedByRole: user.role
  });

  return { message: "Question soft deleted successfully" };
};
