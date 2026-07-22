import { InterviewSessionRepository } from "../repositories/interviewSession.repository.js";
import { InterviewSessionMapper } from "../mappers/interviewSession.mapper.js";
import { MeetingProviderFactory } from "../engine/meeting/MeetingProviderFactory.js";
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
  if (!companyId && user.role !== "CANDIDATE") {
    throw new AppError("Company not found", 404);
  }
  return companyId;
};

export const createInterviewSessionWorkflow = async (data, user) => {
  const companyId = await getCompanyId(user);

  // Initialize meeting provider
  const meetingProvider = MeetingProviderFactory.getProvider(data.meetingProvider || "INTERNAL");
  const roomDetails = await meetingProvider.createRoom(data);

  const session = await InterviewSessionRepository.create({
    ...data,
    companyId,
    meetingProvider: data.meetingProvider || "INTERNAL",
    meetingUrl: roomDetails.meetingUrl,
    meetingRoomId: roomDetails.meetingRoomId,
    metadata: roomDetails.metadata || null
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: session.id,
    action: ACTIVITY_ACTIONS.SCHEDULE,
    metadata: { title: session.title, scheduledAt: session.scheduledAt },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(session);
};

export const getInterviewSessionsWorkflow = async (filters, page = 1, limit = 10, user) => {
  let companyId;
  if (user.role !== "CANDIDATE") {
    companyId = await getCompanyId(user);
  }

  const skip = (page - 1) * limit;
  const { total, data } = await InterviewSessionRepository.findByCompanyId(companyId, filters, skip, limit);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    data: data.map(InterviewSessionMapper.toDto)
  };
};

export const getInterviewSessionByIdWorkflow = async (sessionId, user) => {
  let companyId;
  if (user.role !== "CANDIDATE") {
    companyId = await getCompanyId(user);
  }

  const session = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!session) throw new AppError("Interview session not found", 404);

  return InterviewSessionMapper.toDto(session);
};

export const updateInterviewSessionWorkflow = async (sessionId, updateData, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  await InterviewSessionRepository.update(sessionId, companyId, updateData);
  if (updateData.scheduledAt) {
    await InterviewSessionRepository.addTimelineEvent(
      sessionId,
      "SESSION_RESCHEDULED",
      `Session rescheduled to ${updateData.scheduledAt}`,
      { rescheduledAt: updateData.scheduledAt }
    );
  }

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { sessionId },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const startInterviewSessionWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  if (["COMPLETED", "CANCELLED"].includes(existing.status)) {
    throw new AppError(`Cannot start session in ${existing.status} status`, 400);
  }

  const startedAt = new Date();
  await InterviewSessionRepository.updateStatus(sessionId, companyId, "LIVE", { startedAt });
  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "SESSION_STARTED",
    `Interview session started by ${user.name || user.email}`,
    { startedAt, startedBy: user.id }
  );

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { status: "LIVE", startedAt },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const pauseInterviewSessionWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);
  if (existing.status !== "LIVE") {
    throw new AppError("Only LIVE sessions can be paused", 400);
  }

  const pausedAt = new Date();
  await InterviewSessionRepository.updateStatus(sessionId, companyId, "PAUSED", { pausedAt });
  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "SESSION_PAUSED",
    `Interview session paused by ${user.name || user.email}`,
    { pausedAt }
  );

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { status: "PAUSED" },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const resumeInterviewSessionWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);
  if (existing.status !== "PAUSED") {
    throw new AppError("Only PAUSED sessions can be resumed", 400);
  }

  const resumedAt = new Date();
  await InterviewSessionRepository.updateStatus(sessionId, companyId, "LIVE", { resumedAt });
  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "SESSION_RESUMED",
    `Interview session resumed by ${user.name || user.email}`,
    { resumedAt }
  );

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.UPDATE,
    metadata: { status: "LIVE" },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const completeInterviewSessionWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  const completedAt = new Date();
  let actualDurationSeconds = existing.actualDurationSeconds || 0;
  if (existing.startedAt) {
    actualDurationSeconds = Math.round((completedAt - new Date(existing.startedAt)) / 1000);
  }

  await InterviewSessionRepository.updateStatus(sessionId, companyId, "COMPLETED", {
    completedAt,
    actualDurationSeconds
  });

  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "SESSION_COMPLETED",
    `Interview session completed by ${user.name || user.email}`,
    { completedAt, durationSeconds: actualDurationSeconds }
  );

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.COMPLETE,
    metadata: { status: "COMPLETED", durationSeconds: actualDurationSeconds },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const cancelInterviewSessionWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const existing = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!existing) throw new AppError("Interview session not found", 404);

  const cancelledAt = new Date();
  await InterviewSessionRepository.updateStatus(sessionId, companyId, "CANCELLED", { cancelledAt });
  await InterviewSessionRepository.addTimelineEvent(
    sessionId,
    "SESSION_CANCELLED",
    `Interview session cancelled by ${user.name || user.email}`,
    { cancelledAt }
  );

  const updated = await InterviewSessionRepository.findById(sessionId, companyId);

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: ACTIVITY_ACTIONS.CANCEL,
    metadata: { status: "CANCELLED" },
    performedByRole: user.role
  });

  return InterviewSessionMapper.toDto(updated);
};

export const getSessionTimelineWorkflow = async (sessionId, user) => {
  let companyId;
  if (user.role !== "CANDIDATE") {
    companyId = await getCompanyId(user);
  }

  const timeline = await InterviewSessionRepository.getTimeline(sessionId, companyId);
  if (!timeline) throw new AppError("Interview session not found", 404);

  return timeline.map(InterviewSessionMapper.toTimelineDto);
};
