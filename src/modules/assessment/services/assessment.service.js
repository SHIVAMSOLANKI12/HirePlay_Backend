import AppError from "../../../utils/AppError.js";
import { AssessmentRepository } from "../repositories/assessment.repository.js";
import { AssessmentMapper } from "../mappers/assessment.mapper.js";

export const createAssessmentService = async (data) => {
  const assessment = await AssessmentRepository.create(data);
  return AssessmentMapper.toDto(assessment);
};

export const getAssessmentsService = async (companyId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const { total, data } = await AssessmentRepository.findByCompanyId(companyId, skip, limit);
  
  return {
    total,
    page,
    limit,
    data: data.map(AssessmentMapper.toDto)
  };
};

export const getAssessmentByIdService = async (id, companyId) => {
  const assessment = await AssessmentRepository.findById(id);
  
  if (!assessment || assessment.deletedAt) {
    throw new AppError("Assessment not found", 404);
  }
  
  if (assessment.companyId !== companyId) {
    throw new AppError("Forbidden: You do not have access to this assessment", 403);
  }

  return AssessmentMapper.toDto(assessment);
};

export const updateAssessmentService = async (id, companyId, updateData) => {
  // Verify existence and ownership
  await getAssessmentByIdService(id, companyId);
  
  const updated = await AssessmentRepository.update(id, updateData);
  return AssessmentMapper.toDto(updated);
};

export const deleteAssessmentService = async (id, companyId) => {
  // Verify existence and ownership
  await getAssessmentByIdService(id, companyId);
  
  await AssessmentRepository.softDelete(id);
  return true;
};
