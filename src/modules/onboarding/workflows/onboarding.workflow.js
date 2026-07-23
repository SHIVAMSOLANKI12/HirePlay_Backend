import { OnboardingRepository } from "../repositories/onboarding.repository.js";
import { EmployeeProfileRepository } from "../repositories/employeeProfile.repository.js";
import { OnboardingMapper } from "../mappers/onboarding.mapper.js";
import { OnboardingStageEngine } from "../engine/OnboardingStageEngine.js";
import { EmployeeIdGenerator } from "../engine/EmployeeIdGenerator.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
import { logActivity } from "../../activity/services/activityLog.service.js";
import { ACTIVITY_ENTITIES, ACTIVITY_ACTIONS } from "../../activity/constants/activity.constants.js";
import { eventEngine } from "../../notification/events/event.engine.js";
import { ACTIVITY_EVENTS } from "../../activity/constants/activity.events.js";
import prisma from "../../../config/prisma.js";
import { OnboardingTaskRepository } from "../repositories/onboardingTask.repository.js";
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

export const createOnboardingWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  if (!data.offerId) throw new AppError("offerId is required", 400);

  const offer = await prisma.offer.findUnique({
    where: { id: data.offerId },
    include: { application: true, candidate: true }
  });

  if (!offer) throw new AppError("Offer not found", 404);

  // Business Rule: Onboarding can only begin after Offer ACCEPTED or Candidate HIRED
  const isAccepted = offer.status === "ACCEPTED";
  const isCandidateHired = offer.application?.status === "HIRED";

  if (!isAccepted && !isCandidateHired) {
    throw new AppError("Onboarding can only be initialized after Offer status is ACCEPTED or Candidate is HIRED.", 400);
  }

  const existingRecord = await OnboardingRepository.findByOfferId(data.offerId, companyId);
  if (existingRecord) {
    throw new AppError("Onboarding record already exists for this offer.", 409);
  }

  const defaultStages = OnboardingStageEngine.getDefaultStages();
  const expectedJoiningDate = data.expectedJoiningDate || offer.joiningDate || new Date();

  const record = await OnboardingRepository.create({
    companyId,
    offerId: data.offerId,
    candidateId: offer.candidateId,
    hrOwnerId: data.hrOwnerId || user.id,
    managerId: data.managerId || null,
    expectedJoiningDate,
    notes: data.notes || null,
    workflowStages: defaultStages
  });

  // Populate Task Engine Tasks from company templates or defaults
  const templates = await OnboardingTaskRepository.findTaskTemplatesByCompanyId(companyId);
  if (templates.length > 0) {
    for (const t of templates) {
      await OnboardingTaskRepository.createTask({
        onboardingId: record.id,
        templateId: t.id,
        title: t.title,
        description: t.description,
        category: t.category,
        isRequired: t.isRequired,
        assignedRole: t.assignedRole
      });
    }
  } else {
    // Default enterprise tasks
    const defaultTasks = [
      { title: "Passport & Identity Document Verification", category: "DOCUMENT", assignedRole: "CANDIDATE" },
      { title: "Background & Prior Employment Verification", category: "BACKGROUND_CHECK", assignedRole: "HR" },
      { title: "IT Laptop & System Access Provisioning", category: "IT_PROVISIONING", assignedRole: "HR" },
      { title: "HR Orientation & Company Policy Acknowledgment", category: "ORIENTATION", assignedRole: "CANDIDATE" }
    ];
    for (const dt of defaultTasks) {
      await OnboardingTaskRepository.createTask({
        onboardingId: record.id,
        title: dt.title,
        category: dt.category,
        assignedRole: dt.assignedRole
      });
    }
  }

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: record.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { offerId: data.offerId, candidateId: offer.candidateId },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.ONBOARDING_CREATED, {
    onboardingId: record.id,
    companyId,
    candidateId: offer.candidateId,
    offerId: data.offerId
  });

  return OnboardingMapper.toDto(record);
};

export const getOnboardingsWorkflow = async (filters, page = 1, limit = 10, user) => {
  const companyId = await getCompanyId(user);
  const skip = (page - 1) * limit;

  const { total, data } = await OnboardingRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(OnboardingMapper.toDto)
  };
};

export const getOnboardingByIdWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);

  const record = await OnboardingRepository.findById(id, companyId);
  if (!record) throw new AppError("Onboarding record not found", 404);

  return OnboardingMapper.toDto(record);
};

export const updateOnboardingWorkflow = async (id, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await OnboardingRepository.findById(id, companyId);
  if (!existing) throw new AppError("Onboarding record not found", 404);

  if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
    throw new AppError(`Cannot update onboarding in ${existing.status} status.`, 400);
  }

  let progressPercentage = existing.progressPercentage;
  let workflowStages = existing.joiningWorkflow?.stages || [];

  const { stages, ...directFields } = updateData;

  if (stages) {
    workflowStages = stages;
    const calc = OnboardingStageEngine.calculateProgress(workflowStages);
    progressPercentage = calc.progressPercentage;

    await OnboardingRepository.updateWorkflow(id, {
      stages: workflowStages,
      completedStages: calc.completedStages,
      totalStages: calc.totalStages,
      isCompleted: calc.isCompleted
    });
  }

  await OnboardingRepository.update(id, companyId, {
    ...directFields,
    progressPercentage
  });

  const updated = await OnboardingRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: id,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { currentStage: updated.currentStage, progressPercentage },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.ONBOARDING_UPDATED, {
    onboardingId: id,
    companyId,
    progressPercentage
  });

  return OnboardingMapper.toDto(updated);
};

export const startOnboardingWorkflow = async (id, user) => {
  const companyId = await getCompanyId(user);

  const existing = await OnboardingRepository.findById(id, companyId);
  if (!existing) throw new AppError("Onboarding record not found", 404);

  await OnboardingRepository.update(id, companyId, {
    status: "IN_PROGRESS",
    currentStage: "In Progress / Pre-Joining"
  });

  await OnboardingRepository.updateWorkflow(id, {
    startedAt: new Date()
  });

  const updated = await OnboardingRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: id,
    action: ACTIVITY_ACTIONS.START,
    metadata: { status: "IN_PROGRESS" },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.ONBOARDING_STARTED, {
    onboardingId: id,
    companyId
  });

  return OnboardingMapper.toDto(updated);
};

export const completeOnboardingWorkflow = async (id, profileData = {}, user) => {
  const companyId = await getCompanyId(user);

  const existing = await OnboardingRepository.findById(id, companyId);
  if (!existing) throw new AppError("Onboarding record not found", 404);

  if (existing.status === "COMPLETED") {
    throw new AppError("Onboarding is already completed.", 400);
  }

  const actualJoiningDate = profileData.joiningDate || new Date();

  // 1. Mark OnboardingRecord and Workflow as COMPLETED
  await OnboardingRepository.update(id, companyId, {
    status: "COMPLETED",
    currentStage: "Completed & Joined",
    progressPercentage: 100.0,
    actualJoiningDate
  });

  await OnboardingRepository.updateWorkflow(id, {
    isCompleted: true,
    completedStages: existing.joiningWorkflow?.totalStages || 4,
    completedAt: new Date()
  });

  // 2. Generate unique Employee Number via EmployeeIdGenerator
  const employeeNumber = await EmployeeIdGenerator.generateEmployeeId(companyId);

  // 3. Create or Activate EmployeeProfile
  let employeeProfile = await EmployeeProfileRepository.findByUserId(existing.candidateId, companyId);

  if (!employeeProfile) {
    employeeProfile = await EmployeeProfileRepository.create({
      companyId,
      userId: existing.candidateId,
      onboardingId: id,
      employeeNumber,
      department: profileData.department || existing.offer?.department || "Engineering",
      designation: profileData.designation || existing.offer?.jobTitle || "Software Engineer",
      employmentType: profileData.employmentType || existing.offer?.employmentType || "FULL_TIME",
      managerId: profileData.managerId || existing.managerId || null,
      joiningDate: actualJoiningDate,
      probationPeriodMonths: profileData.probationPeriodMonths || 3,
      workLocation: profileData.workLocation || existing.offer?.location || "Head Office",
      salary: profileData.salary || existing.offer?.salary || null,
      currency: profileData.currency || existing.offer?.currency || "USD",
      lifecycleState: "JOINED",
      historyReason: "Completed Onboarding Workflow",
      historyActorId: user.id
    });
  } else {
    await EmployeeProfileRepository.updateState(
      employeeProfile.id,
      companyId,
      employeeProfile.lifecycleState,
      "JOINED",
      user.id,
      "Completed Onboarding Workflow"
    );
  }

  const updated = await OnboardingRepository.findById(id, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.ONBOARDING,
    entityId: id,
    action: ACTIVITY_ACTIONS.COMPLETE,
    metadata: { employeeNumber, employeeProfileId: employeeProfile.id },
    performedByRole: user.role
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.EMPLOYEE_PROFILE,
    entityId: employeeProfile.id,
    action: ACTIVITY_ACTIONS.CREATE,
    metadata: { employeeNumber, designation: employeeProfile.designation },
    performedByRole: user.role
  });

  eventEngine.emit(ACTIVITY_EVENTS.ONBOARDING_COMPLETED, {
    onboardingId: id,
    companyId,
    employeeNumber,
    candidateId: existing.candidateId
  });

  eventEngine.emit(ACTIVITY_EVENTS.EMPLOYEE_JOINED, {
    companyId,
    employeeNumber,
    candidateId: existing.candidateId
  });

  return OnboardingMapper.toDto(updated);
};
