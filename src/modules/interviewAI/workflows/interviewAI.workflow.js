import { InterviewAIRepository } from "../repositories/interviewAI.repository.js";
import { InterviewSessionRepository } from "../../interviewSession/repositories/interviewSession.repository.js";
import { InterviewScorecardRepository } from "../../interviewScorecard/repositories/interviewScorecard.repository.js";
import { InterviewAIMapper } from "../mappers/interviewAI.mapper.js";
import { AIProviderFactory } from "../engine/ai/AIProviderFactory.js";
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

export const analyzeInterviewWorkflow = async (sessionId, options = {}, user) => {
  const companyId = await getCompanyId(user);

  const session = await InterviewSessionRepository.findById(sessionId, companyId);
  if (!session) throw new AppError("Interview session not found", 404);

  const scorecards = await InterviewScorecardRepository.findBySessionId(sessionId, companyId);
  const submittedScorecards = scorecards.filter(sc => sc.status === "SUBMITTED" || sc.status === "LOCKED");

  if (submittedScorecards.length === 0) {
    throw new AppError("Cannot perform AI Analysis until at least one interviewer scorecard has been submitted.", 400);
  }

  const latestVersion = await InterviewAIRepository.getLatestVersionNumber(sessionId);
  const nextVersion = latestVersion + 1;

  const providerType = options.provider || "RULE_BASED";
  const aiProvider = AIProviderFactory.getProvider(providerType);
  const analysisResult = await aiProvider.analyzeInterview(session, submittedScorecards, options);

  const savedAnalysis = await InterviewAIRepository.saveAnalysis({
    companyId,
    sessionId,
    version: nextVersion,
    provider: providerType,
    confidenceScore: analysisResult.confidenceScore,
    confidenceReason: analysisResult.confidenceReason,
    overallRecommendation: analysisResult.overallRecommendation,
    summary: analysisResult.summary,
    insights: analysisResult.insights,
    risks: analysisResult.risks,
    recommendations: analysisResult.recommendations
  });

  await logActivity({
    companyId,
    userId: user.id,
    entityType: ACTIVITY_ENTITIES.INTERVIEW,
    entityId: sessionId,
    action: latestVersion > 0 ? ACTIVITY_ACTIONS.UPDATE : ACTIVITY_ACTIONS.GENERATE,
    metadata: { analysisId: savedAnalysis.id, version: nextVersion, provider: providerType },
    performedByRole: user.role
  });

  return InterviewAIMapper.toDto(savedAnalysis);
};

export const getAIAnalysisWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const analysis = await InterviewAIRepository.getLatestAnalysisBySessionId(sessionId, companyId);
  if (!analysis) throw new AppError("AI Analysis not found for this session. Please trigger /analyze first.", 404);

  return InterviewAIMapper.toDto(analysis);
};

export const getAISummaryWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const summary = await InterviewAIRepository.getSummaryBySessionId(sessionId, companyId);
  if (!summary) throw new AppError("AI Summary not found for this session.", 404);

  return InterviewAIMapper.toSummaryDto(summary);
};

export const getAIRisksWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const risks = await InterviewAIRepository.getRisksBySessionId(sessionId, companyId);
  return risks.map(InterviewAIMapper.toRiskDto);
};

export const getAIRecommendationsWorkflow = async (sessionId, user) => {
  const companyId = await getCompanyId(user);

  const recData = await InterviewAIRepository.getRecommendationsBySessionId(sessionId, companyId);
  if (!recData) throw new AppError("AI Recommendations not found for this session.", 404);

  return {
    overallRecommendation: recData.overallRecommendation,
    confidenceScore: recData.confidenceScore,
    recommendations: recData.recommendations.map(InterviewAIMapper.toRecommendationDto)
  };
};
