export class InterviewAIMapper {
  static toDto(analysis) {
    if (!analysis) return null;

    return {
      id: analysis.id,
      companyId: analysis.companyId,
      sessionId: analysis.sessionId,
      version: analysis.version,
      provider: analysis.provider,
      confidenceScore: analysis.confidenceScore,
      confidenceReason: analysis.confidenceReason,
      overallRecommendation: analysis.overallRecommendation,
      summary: InterviewAIMapper.toSummaryDto(analysis.summary),
      insights: analysis.insights && analysis.insights.length > 0
        ? InterviewAIMapper.toInsightDto(analysis.insights[0])
        : null,
      risks: analysis.risks ? analysis.risks.map(InterviewAIMapper.toRiskDto) : [],
      recommendations: analysis.recommendations ? analysis.recommendations.map(InterviewAIMapper.toRecommendationDto) : [],
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt
    };
  }

  static toSummaryDto(summary) {
    if (!summary) return null;
    return {
      id: summary.id,
      candidateSummary: summary.candidateSummary,
      interviewSummary: summary.interviewSummary,
      technicalAnalysis: summary.technicalAnalysis,
      communicationAnalysis: summary.communicationAnalysis,
      problemSolvingAnalysis: summary.problemSolvingAnalysis,
      leadershipAnalysis: summary.leadershipAnalysis,
      cultureFitAnalysis: summary.cultureFitAnalysis
    };
  }

  static toInsightDto(insight) {
    if (!insight) return null;
    return {
      id: insight.id,
      topStrengths: insight.topStrengths || [],
      topWeaknesses: insight.topWeaknesses || [],
      improvementAreas: insight.improvementAreas || [],
      recommendedTraining: insight.recommendedTraining || [],
      suggestedNextFocus: insight.suggestedNextFocus,
      hiringReadinessScore: insight.hiringReadinessScore
    };
  }

  static toRiskDto(risk) {
    if (!risk) return null;
    return {
      id: risk.id,
      riskType: risk.riskType,
      severity: risk.severity,
      description: risk.description,
      mitigation: risk.mitigation
    };
  }

  static toRecommendationDto(recommendation) {
    if (!recommendation) return null;
    return {
      id: recommendation.id,
      category: recommendation.category,
      recommendation: recommendation.recommendation,
      justification: recommendation.justification
    };
  }
}
