import asyncHandler from "../../../middleware/async.middleware.js";
import { successResponse } from "../../../utils/apiResponse.js";
import {
  createOnboardingWorkflow,
  getOnboardingsWorkflow,
  getOnboardingByIdWorkflow,
  updateOnboardingWorkflow,
  startOnboardingWorkflow,
  completeOnboardingWorkflow
} from "../workflows/onboarding.workflow.js";
import {
  getEmployeesWorkflow,
  getEmployeeByIdWorkflow
} from "../workflows/employeeProfile.workflow.js";
import {
  createTaskTemplateWorkflow,
  getTaskTemplatesWorkflow,
  createOnboardingTaskWorkflow,
  getOnboardingTasksWorkflow,
  updateOnboardingTaskStatusWorkflow
} from "../workflows/taskEngine.workflow.js";

export const createOnboarding = asyncHandler(async (req, res) => {
  const record = await createOnboardingWorkflow(req.body, req.user);
  successResponse(res, record, "Onboarding record initialized successfully", 201);
});

export const getOnboardings = asyncHandler(async (req, res) => {
  const { page, limit, status, candidateId, hrOwnerId } = req.query;
  const result = await getOnboardingsWorkflow(
    { status, candidateId, hrOwnerId },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Onboarding records retrieved successfully");
});

export const getOnboardingById = asyncHandler(async (req, res) => {
  const record = await getOnboardingByIdWorkflow(req.params.id, req.user);
  successResponse(res, record, "Onboarding record details retrieved successfully");
});

export const updateOnboarding = asyncHandler(async (req, res) => {
  const record = await updateOnboardingWorkflow(req.params.id, req.body, req.user);
  successResponse(res, record, "Onboarding record updated successfully");
});

export const startOnboarding = asyncHandler(async (req, res) => {
  const record = await startOnboardingWorkflow(req.params.id, req.user);
  successResponse(res, record, "Onboarding workflow started successfully");
});

export const completeOnboarding = asyncHandler(async (req, res) => {
  const record = await completeOnboardingWorkflow(req.params.id, req.body, req.user);
  successResponse(res, record, "Onboarding completed and Employee Profile activated successfully");
});

export const getEmployees = asyncHandler(async (req, res) => {
  const { page, limit, department, designation, lifecycleState } = req.query;
  const result = await getEmployeesWorkflow(
    { department, designation, lifecycleState },
    page,
    limit,
    req.user
  );
  successResponse(res, result, "Employee profiles retrieved successfully");
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const profile = await getEmployeeByIdWorkflow(req.params.employeeId, req.user);
  successResponse(res, profile, "Employee profile details retrieved successfully");
});

export const createTaskTemplate = asyncHandler(async (req, res) => {
  const template = await createTaskTemplateWorkflow(req.body, req.user);
  successResponse(res, template, "Onboarding task template created successfully", 201);
});

export const getTaskTemplates = asyncHandler(async (req, res) => {
  const templates = await getTaskTemplatesWorkflow(req.user);
  successResponse(res, templates, "Onboarding task templates retrieved successfully");
});

export const createOnboardingTask = asyncHandler(async (req, res) => {
  const onboardingId = req.params.onboardingId || req.params.id;
  const task = await createOnboardingTaskWorkflow(onboardingId, req.body, req.user);
  successResponse(res, task, "Onboarding task created successfully", 201);
});

export const getOnboardingTasks = asyncHandler(async (req, res) => {
  const onboardingId = req.params.onboardingId || req.params.id;
  const tasks = await getOnboardingTasksWorkflow(onboardingId, req.user);
  successResponse(res, tasks, "Onboarding tasks retrieved successfully");
});

export const updateOnboardingTaskStatus = asyncHandler(async (req, res) => {
  const onboardingId = req.params.onboardingId || req.params.id;
  const task = await updateOnboardingTaskStatusWorkflow(onboardingId, req.params.taskId, req.body, req.user);
  successResponse(res, task, "Onboarding task status updated successfully");
});
