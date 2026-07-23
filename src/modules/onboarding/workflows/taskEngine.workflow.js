import { OnboardingTaskRepository } from "../repositories/onboardingTask.repository.js";
import { OnboardingRepository } from "../repositories/onboarding.repository.js";
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

export const createTaskTemplateWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  if (!data.title) throw new AppError("Task template title is required", 400);

  const template = await OnboardingTaskRepository.createTaskTemplate({
    ...data,
    companyId
  });

  return template;
};

export const getTaskTemplatesWorkflow = async (user) => {
  const companyId = await getCompanyId(user);
  return await OnboardingTaskRepository.findTaskTemplatesByCompanyId(companyId);
};

export const createOnboardingTaskWorkflow = async (onboardingId, data, user) => {
  const companyId = await getCompanyId(user);

  const onboarding = await OnboardingRepository.findById(onboardingId, companyId);
  if (!onboarding) throw new AppError("Onboarding record not found", 404);

  if (!data.title) throw new AppError("Task title is required", 400);

  const task = await OnboardingTaskRepository.createTask({
    ...data,
    onboardingId
  });

  // Recalculate onboarding progress
  const allTasks = await OnboardingTaskRepository.findTasksByOnboardingId(onboardingId);
  const requiredTasks = allTasks.filter(t => t.isRequired);
  if (requiredTasks.length > 0) {
    const completedCount = requiredTasks.filter(t => t.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedCount / requiredTasks.length) * 100 * 10) / 10;
    await OnboardingRepository.update(onboardingId, companyId, { progressPercentage });
  }

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: onboardingId,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { action: "CREATE_ONBOARDING_TASK", taskTitle: task.title },
    performedByRole: user.role
  });

  return task;
};

export const getOnboardingTasksWorkflow = async (onboardingId, user) => {
  const companyId = await getCompanyId(user);

  const onboarding = await OnboardingRepository.findById(onboardingId, companyId);
  if (!onboarding) throw new AppError("Onboarding record not found", 404);

  return await OnboardingTaskRepository.findTasksByOnboardingId(onboardingId);
};

export const updateOnboardingTaskStatusWorkflow = async (onboardingId, taskId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const onboarding = await OnboardingRepository.findById(onboardingId, companyId);
  if (!onboarding) throw new AppError("Onboarding record not found", 404);

  const status = updateData.status;
  const completedAt = status === "COMPLETED" ? new Date() : null;
  const completedById = status === "COMPLETED" ? user.id : null;

  const updatedTask = await OnboardingTaskRepository.updateTask(taskId, {
    status,
    completedAt,
    completedById,
    comments: updateData.comments || undefined
  });

  // Recalculate progress percentage on OnboardingRecord
  const allTasks = await OnboardingTaskRepository.findTasksByOnboardingId(onboardingId);
  const requiredTasks = allTasks.filter(t => t.isRequired);
  if (requiredTasks.length > 0) {
    const completedCount = requiredTasks.filter(t => t.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedCount / requiredTasks.length) * 100 * 10) / 10;
    await OnboardingRepository.update(onboardingId, companyId, { progressPercentage });
  }

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: onboardingId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { action: "UPDATE_ONBOARDING_TASK_STATUS", taskId, status },
    performedByRole: user.role
  });

  return updatedTask;
};
