import { 
  createAssessmentService, 
  getAssessmentsService, 
  getAssessmentByIdService, 
  updateAssessmentService, 
  deleteAssessmentService 
} from "../services/assessment.service.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import AppError from "../../../utils/AppError.js";

const getCompanyId = async (user) => {
  let companyId = user.companyId;
  if (!companyId && user.role === "COMPANY_ADMIN") {
    const existingCompany = await findCompanyByOwnerId(user.id);
    if (existingCompany) {
      companyId = existingCompany.id;
    }
  }
  if (!companyId) {
    throw new AppError("Company not found. You must belong to a company to perform this action.", 404);
  }
  return companyId;
};
export const createAssessmentWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);
  
  const assessment = await createAssessmentService({
    ...data,
    companyId: companyId,
    createdBy: user.id
  });

  await logActivity({
    companyId: companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: assessment.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { title: assessment.title, gamesCount: assessment.games.length },
    performedByRole: user.role
  });

  return assessment;
};

export const getAssessmentsWorkflow = async (user, page, limit) => {
  const companyId = await getCompanyId(user);
  return await getAssessmentsService(companyId, page, limit);
};

export const getAssessmentByIdWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);
  return await getAssessmentByIdService(id, companyId);
};

export const updateAssessmentWorkflow = async (id, updateData, user) => {
  const companyId = await getCompanyId(user);
  const oldAssessment = await getAssessmentByIdService(id, companyId);
  
  const updated = await updateAssessmentService(id, companyId, updateData);

  await logActivity({
    companyId: companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: id,
    action: ACTIVITY_ACTIONS.UPDATE,
    oldValue: { status: oldAssessment.status, title: oldAssessment.title },
    newValue: { status: updated.status, title: updated.title },
    performedByRole: user.role
  });

  return updated;
};

export const deleteAssessmentWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);
  await deleteAssessmentService(id, companyId);

  await logActivity({
    companyId: companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ASSESSMENT,
    entityId: id,
    action: ACTIVITY_ACTIONS.DELETE,
    performedByRole: user.role
  });

  return true;
};
