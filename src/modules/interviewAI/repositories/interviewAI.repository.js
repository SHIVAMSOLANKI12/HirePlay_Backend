import prisma from "../../../config/prisma.js";

export class InterviewAIRepository {
  static async getLatestAnalysisBySessionId(sessionId, companyId) {
    const where = { sessionId };
    if (companyId) where.companyId = companyId;

    return await prisma.interviewAIAnalysis.findFirst({
      where,
      orderBy: { version: "desc" },
      include: {
        summary: true,
        insights: true,
        risks: true,
        recommendations: true,
        session: true
      }
    });
  }

  static async getLatestVersionNumber(sessionId) {
    const latest = await prisma.interviewAIAnalysis.findFirst({
      where: { sessionId },
      orderBy: { version: "desc" },
      select: { version: true }
    });
    return latest ? latest.version : 0;
  }

  static async saveAnalysis(data) {
    const { summary, insights, risks = [], recommendations = [], ...analysisData } = data;

    return await prisma.interviewAIAnalysis.create({
      data: {
        companyId: analysisData.companyId,
        sessionId: analysisData.sessionId,
        version: analysisData.version || 1,
        provider: analysisData.provider || "RULE_BASED",
        confidenceScore: analysisData.confidenceScore || 85.0,
        confidenceReason: analysisData.confidenceReason || null,
        overallRecommendation: analysisData.overallRecommendation,
        summary: summary ? {
          create: {
            candidateSummary: summary.candidateSummary,
            interviewSummary: summary.interviewSummary,
            technicalAnalysis: summary.technicalAnalysis || null,
            communicationAnalysis: summary.communicationAnalysis || null,
            problemSolvingAnalysis: summary.problemSolvingAnalysis || null,
            leadershipAnalysis: summary.leadershipAnalysis || null,
            cultureFitAnalysis: summary.cultureFitAnalysis || null
          }
        } : undefined,
        insights: insights ? {
          create: {
            topStrengths: insights.topStrengths || [],
            topWeaknesses: insights.topWeaknesses || [],
            improvementAreas: insights.improvementAreas || [],
            recommendedTraining: insights.recommendedTraining || [],
            suggestedNextFocus: insights.suggestedNextFocus || null,
            hiringReadinessScore: insights.hiringReadinessScore || 80.0
          }
        } : undefined,
        risks: {
          create: risks.map(r => ({
            riskType: r.riskType,
            severity: r.severity || "LOW",
            description: r.description,
            mitigation: r.mitigation || null
          }))
        },
        recommendations: {
          create: recommendations.map(rec => ({
            category: rec.category,
            recommendation: rec.recommendation,
            justification: rec.justification
          }))
        }
      },
      include: {
        summary: true,
        insights: true,
        risks: true,
        recommendations: true,
        session: true
      }
    });
  }

  static async getSummaryBySessionId(sessionId, companyId) {
    const analysis = await this.getLatestAnalysisBySessionId(sessionId, companyId);
    return analysis ? analysis.summary : null;
  }

  static async getRisksBySessionId(sessionId, companyId) {
    const analysis = await this.getLatestAnalysisBySessionId(sessionId, companyId);
    return analysis ? analysis.risks : [];
  }

  static async getRecommendationsBySessionId(sessionId, companyId) {
    const analysis = await this.getLatestAnalysisBySessionId(sessionId, companyId);
    return analysis ? {
      overallRecommendation: analysis.overallRecommendation,
      confidenceScore: analysis.confidenceScore,
      recommendations: analysis.recommendations
    } : null;
  }
}
