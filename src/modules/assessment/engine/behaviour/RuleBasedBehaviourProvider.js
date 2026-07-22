import { BehaviourAnalysisProvider } from "./BehaviourAnalysisProvider.interface.js";

export class RuleBasedBehaviourProvider extends BehaviourAnalysisProvider {
  /**
   * Analyzes gameplay metrics and generates behavioural traits.
   */
  async analyze(inputData) {
    const { moves = [], sessionContext = {}, scoreResult = {} } = inputData;

    const {
      timeTakenMs = 0,
      cheatRiskScore = 0,
      pauseCount = 0,
      idleTimeMs = 0
    } = sessionContext;

    const {
      score = 0,
      accuracy = 100,
      efficiency = 100,
      decisionSpeed = 0 // avg seconds per move
    } = scoreResult;

    const moveCount = moves.length;

    // 1. Thinking Speed (0 - 100)
    // Faster move execution (lower decisionSpeed) = higher thinking speed score
    let thinkingSpeed = 70;
    if (decisionSpeed > 0) {
      if (decisionSpeed <= 2) thinkingSpeed = 95;
      else if (decisionSpeed <= 4) thinkingSpeed = 85;
      else if (decisionSpeed <= 7) thinkingSpeed = 70;
      else if (decisionSpeed <= 12) thinkingSpeed = 50;
      else thinkingSpeed = 35;
    }

    // 2. Decision Quality (0 - 100)
    const decisionQuality = Math.min(100, Math.max(0, (accuracy * 0.6) + (efficiency * 0.4)));

    // 3. Problem Solving (0 - 100)
    const problemSolving = Math.min(100, Math.max(0, (efficiency * 0.5) + (score * 0.5)));

    // 4. Planning Ability (0 - 100)
    // Upfront reflection (delay on 1st move) followed by smooth execution
    let planningAbility = 65;
    const firstMoveTime = moves.length > 0 ? (moves[0].moveDurationMs || 0) : 0;
    if (firstMoveTime > 3000 && efficiency > 75) {
      planningAbility = 90;
    } else if (firstMoveTime > 1500 && efficiency > 60) {
      planningAbility = 75;
    } else if (firstMoveTime < 1000 && efficiency < 50) {
      planningAbility = 40;
    }

    // 5. Consistency (0 - 100)
    let consistency = 75;
    if (moveCount > 2) {
      const moveDurations = moves.map(m => m.moveDurationMs || 0);
      const mean = moveDurations.reduce((a, b) => a + b, 0) / moveCount;
      const variance = moveDurations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / moveCount;
      const stdDev = Math.sqrt(variance);
      // Lower stdDev relative to mean = higher consistency
      const cv = mean > 0 ? stdDev / mean : 1;
      consistency = Math.min(100, Math.max(20, Math.round(100 - (cv * 40))));
    }

    // 6. Risk Taking (0 - 100)
    let riskTaking = 50;
    const fastMovesCount = moves.filter(m => (m.moveDurationMs || 0) < 1500).length;
    const fastMoveRatio = moveCount > 0 ? fastMovesCount / moveCount : 0;
    riskTaking = Math.min(100, Math.max(10, Math.round(fastMoveRatio * 100)));

    // 7. Learning Pattern (0 - 100)
    let learningPattern = 70;
    if (moveCount >= 4) {
      const halfIndex = Math.floor(moveCount / 2);
      const firstHalfAvg = moves.slice(0, halfIndex).reduce((sum, m) => sum + (m.moveDurationMs || 0), 0) / halfIndex;
      const secondHalfAvg = moves.slice(halfIndex).reduce((sum, m) => sum + (m.moveDurationMs || 0), 0) / (moveCount - halfIndex);
      
      if (secondHalfAvg < firstHalfAvg * 0.8) {
        learningPattern = 90; // Got faster as candidate understood pattern
      } else if (secondHalfAvg > firstHalfAvg * 1.3) {
        learningPattern = 50; // Struggled in later stage
      }
    }

    // 8. Stress Indicator (0 - 100)
    let stressIndicator = 10;
    if (pauseCount > 2) stressIndicator += (pauseCount - 2) * 15;
    if (idleTimeMs > 15000) stressIndicator += 20;
    if (cheatRiskScore > 20) stressIndicator += 30;
    stressIndicator = Math.min(100, Math.max(0, stressIndicator));

    // 9. Confidence Indicator (0 - 100)
    let confidenceIndicator = 80;
    if (thinkingSpeed > 75 && efficiency > 70) confidenceIndicator = 92;
    if (stressIndicator > 50) confidenceIndicator -= 30;
    confidenceIndicator = Math.min(100, Math.max(10, confidenceIndicator));

    // 10. Recruiter Summary Traits Generation
    const behaviourSummary = [];
    if (thinkingSpeed >= 75) behaviourSummary.push("Fast Logical Thinker");
    if (accuracy >= 85) behaviourSummary.push("High Accuracy");
    if (planningAbility >= 75) behaviourSummary.push("Excellent Planner");
    if (thinkingSpeed >= 75 && accuracy < 60) behaviourSummary.push("Impulsive Decisions");
    if (consistency >= 75) behaviourSummary.push("Consistent Performer");
    if (decisionQuality < 55) behaviourSummary.push("Needs Improvement");
    if (confidenceIndicator >= 75) behaviourSummary.push("High Confidence");
    if (confidenceIndicator < 45) behaviourSummary.push("Low Confidence");
    if (stressIndicator >= 60) behaviourSummary.push("High Stress / Hesitant");

    if (behaviourSummary.length === 0) {
      behaviourSummary.push("Balanced Performer");
    }

    return {
      thinkingSpeed: parseFloat(thinkingSpeed.toFixed(2)),
      decisionQuality: parseFloat(decisionQuality.toFixed(2)),
      problemSolving: parseFloat(problemSolving.toFixed(2)),
      planningAbility: parseFloat(planningAbility.toFixed(2)),
      consistency: parseFloat(consistency.toFixed(2)),
      riskTaking: parseFloat(riskTaking.toFixed(2)),
      accuracy: parseFloat(accuracy.toFixed(2)),
      learningPattern: parseFloat(learningPattern.toFixed(2)),
      stressIndicator: parseFloat(stressIndicator.toFixed(2)),
      confidenceIndicator: parseFloat(confidenceIndicator.toFixed(2)),
      behaviourSummary,
      metrics: {
        totalMoves: moveCount,
        fastMoveRatio: parseFloat(fastMoveRatio.toFixed(2)),
        avgMoveDurationMs: decisionSpeed * 1000,
        idleTimeMs,
        pauseCount,
        cheatRiskScore
      }
    };
  }
}
