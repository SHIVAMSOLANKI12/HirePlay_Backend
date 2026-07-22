export class EvaluationEngine {
  /**
   * Calculates overall weighted percentage score for a single scorecard.
   * Formula: (sum(score * weight) / sum(maxScore * weight)) * 100
   * @param {Array<{ score: number, maxScore: number, weight: number }>} scores 
   * @returns {number} Weighted percentage score (0-100) rounded to 2 decimals
   */
  static calculateScorecardWeightedScore(scores = []) {
    if (!scores || scores.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeightedMax = 0;

    scores.forEach(s => {
      const scoreVal = Number(s.score) || 0;
      const maxVal = Number(s.maxScore) || 10;
      const weightVal = Number(s.weight) || 1.0;

      totalWeightedScore += scoreVal * weightVal;
      totalWeightedMax += maxVal * weightVal;
    });

    if (totalWeightedMax === 0) return 0;

    const percentage = (totalWeightedScore / totalWeightedMax) * 100;
    return Math.round(percentage * 100) / 100;
  }

  /**
   * Aggregates scorecards across multiple interviewers for a session.
   * @param {Array<Object>} scorecards List of submitted scorecards
   * @returns {Object} Aggregated metrics and consensus recommendation
   */
  static aggregateSessionEvaluations(scorecards = []) {
    if (!scorecards || scorecards.length === 0) {
      return {
        sessionAverageScore: 0,
        totalScorecards: 0,
        consensusRecommendation: "PENDING",
        recommendationBreakdown: {}
      };
    }

    let totalScoreSum = 0;
    const recommendationCounts = {};

    scorecards.forEach(sc => {
      totalScoreSum += Number(sc.overallScore) || 0;

      if (sc.recommendation) {
        recommendationCounts[sc.recommendation] = (recommendationCounts[sc.recommendation] || 0) + 1;
      }
    });

    const sessionAverageScore = Math.round((totalScoreSum / scorecards.length) * 100) / 100;

    // Consensus recommendation is the most frequent recommendation
    let consensusRecommendation = "BORDERLINE";
    let maxCount = 0;
    Object.keys(recommendationCounts).forEach(rec => {
      if (recommendationCounts[rec] > maxCount) {
        maxCount = recommendationCounts[rec];
        consensusRecommendation = rec;
      }
    });

    return {
      sessionAverageScore,
      totalScorecards: scorecards.length,
      consensusRecommendation,
      recommendationBreakdown: recommendationCounts
    };
  }
}
