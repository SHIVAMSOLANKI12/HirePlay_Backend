import { GameScoringProvider } from "../GameScoringProvider.interface.js";

export class RuleBasedScoringProvider extends GameScoringProvider {
  /**
   * Calculates the final score and metrics for a generic logic game.
   * 
   * @param {Object} seedData - The puzzle seed (includes metadata like timeLimitMs)
   * @param {Array<Object>} moves - Array of game moves
   * @param {Object} sessionContext - Context (timeTakenMs, cheatRiskScore, pauseCount)
   * @param {Object} [scoringProfile] - Configurable weights for evaluation
   * @returns {Promise<Object>}
   */
  async calculateScore(seedData, moves, sessionContext, scoringProfile = {}) {
    const { timeTakenMs, cheatRiskScore, pauseCount } = sessionContext;
    
    // Set up dynamic weights (fallback to general aptitude profile)
    const weightAccuracy = (scoringProfile?.accuracy ?? 60) / 100;
    const weightEfficiency = (scoringProfile?.efficiency ?? 25) / 100;
    const weightDecisionSpeed = (scoringProfile?.decisionSpeed ?? 15) / 100;
    const cheatPenaltyFactor = (scoringProfile?.cheatRisk ?? 40) / 100; // Deduct percentage of cheat score

    const maxScore = 100;
    
    // We expect the GameValidator to have ideally checked these, 
    // but here we do generic rule-based evaluation.
    
    // 1. Completion/Accuracy (Basic Simulation)
    // In a real scenario, GameValidator checks if the solution is exact.
    // Since we don't have game-specific rules, we assume completion is 100% if SUBMITTED.
    // However, we deduct points based on excessive moves.
    const expectedOptimalMoves = seedData.metadata?.optimalMoves || 15;
    const actualMoves = moves.length;
    
    let efficiency = 100;
    if (actualMoves > expectedOptimalMoves) {
      // Lose 5% efficiency for every extra move, cap at 20%
      const extraMoves = actualMoves - expectedOptimalMoves;
      efficiency = Math.max(20, 100 - (extraMoves * 5));
    } else if (actualMoves === 0) {
      efficiency = 0;
    }

    let accuracy = 100; // Generic logic assumes 100% if they felt they completed it
    
    // 2. Decision Speed
    // Average time per move (in seconds)
    const decisionSpeed = actualMoves > 0 ? (timeTakenMs / 1000) / actualMoves : 0;
    
    // 3. Time Score
    const timeLimit = seedData.metadata?.timeLimitMs || 600000; // Default 10 min
    let timeScore = 100;
    if (timeTakenMs > timeLimit) {
      timeScore = 0;
    } else {
      // Faster completion = better time score. Minimum 50 for finishing.
      timeScore = 50 + (50 * (1 - (timeTakenMs / timeLimit)));
    }
    
    // 4. Base Score Calculation
    // Uses the configurable scoring profile weights
    let finalScore = (accuracy * weightAccuracy) + (efficiency * weightEfficiency) + (timeScore * weightDecisionSpeed);
    
    // 5. Penalties
    // Penalty for excessive pausing
    if (pauseCount > 3) {
      finalScore -= (pauseCount - 3) * 2; // -2 points per extra pause
    }
    
    // Penalty for Cheat Risk
    // Uses the dynamic cheatPenaltyFactor (e.g. 40% of the risk score)
    if (cheatRiskScore > 0) {
      finalScore -= (cheatRiskScore * cheatPenaltyFactor);
    }
    
    // Floor at 0, Cap at 100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    return {
      score: parseFloat(finalScore.toFixed(2)),
      maxScore,
      accuracy: parseFloat(accuracy.toFixed(2)),
      efficiency: parseFloat(efficiency.toFixed(2)),
      decisionSpeed: parseFloat(decisionSpeed.toFixed(2)),
      metadata: {
        totalMoves: actualMoves,
        timeTakenSec: parseFloat((timeTakenMs / 1000).toFixed(2)),
        optimalMoves: expectedOptimalMoves,
        penalties: {
          pausePenalty: pauseCount > 3 ? (pauseCount - 3) * 2 : 0,
          cheatPenalty: cheatRiskScore > 0 ? cheatRiskScore * 0.4 : 0
        }
      }
    };
  }
}
