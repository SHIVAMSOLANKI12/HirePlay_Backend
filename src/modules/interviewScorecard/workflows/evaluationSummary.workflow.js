import { InterviewScorecardRepository } from "../repositories/interviewScorecard.repository.js";
import { InterviewScorecardMapper } from "../mappers/interviewScorecard.mapper.js";
import { EvaluationEngine } from "../engine/scoring/EvaluationEngine.js";
import { findCompanyByOwnerId } from "../../company/repositories/company.repository.js";
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

export const getSessionEvaluationsWorkflow = async (sessionId, user) => {
  let companyId;
  if (user.role !== "CANDIDATE") {
    companyId = await getCompanyId(user);
  }

  const scorecards = await InterviewScorecardRepository.findBySessionId(sessionId, companyId);
  const submittedScorecards = scorecards.filter(sc => sc.status === "SUBMITTED" || sc.status === "LOCKED");

  const aggregation = EvaluationEngine.aggregateSessionEvaluations(submittedScorecards);

  return {
    sessionId,
    summary: aggregation,
    scorecards: scorecards.map(InterviewScorecardMapper.toDto)
  };
};
