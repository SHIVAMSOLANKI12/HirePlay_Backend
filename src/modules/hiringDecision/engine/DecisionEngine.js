export class DecisionEngine {
  /**
   * Aggregates scorecards, AI analysis, resume score, and application details to compute overall hiring decision metrics.
   * @param {Array<Object>} scorecards 
   * @param {Object} aiAnalysis 
   * @param {Object} applicationData 
   * @returns {Object} Calculated metrics
   */
  static aggregateDecisionInputs(scorecards = [], aiAnalysis = null, applicationData = {}) {
    let scorecardAvg = 0;
    if (scorecards.length > 0) {
      const sum = scorecards.reduce((acc, sc) => acc + (Number(sc.overallScore) || 0), 0);
      scorecardAvg = Math.round((sum / scorecards.length) * 100) / 100;
    }

    const aiRecommendation = aiAnalysis ? aiAnalysis.overallRecommendation : "PENDING";
    const aiConfidence = aiAnalysis ? aiAnalysis.confidenceScore : 0;
    const resumeScore = applicationData.resume?.parsedData?.matchingScore || 75.0;

    // Overall decision score formula: (ScorecardAvg * 0.6) + (AIConfidence * 0.2) + (ResumeScore * 0.2)
    const calculatedScore = Math.round((scorecardAvg * 0.6 + aiConfidence * 0.2 + resumeScore * 0.2) * 100) / 100;

    let suggestedDecisionType = "BORDERLINE";
    if (calculatedScore >= 80) suggestedDecisionType = "STRONG_HIRE";
    else if (calculatedScore >= 68) suggestedDecisionType = "HIRE";
    else if (calculatedScore >= 55) suggestedDecisionType = "HOLD";
    else suggestedDecisionType = "REJECT";

    return {
      overallScore: calculatedScore,
      scorecardAvg,
      aiRecommendation,
      aiConfidence,
      resumeScore,
      suggestedDecisionType
    };
  }
}
