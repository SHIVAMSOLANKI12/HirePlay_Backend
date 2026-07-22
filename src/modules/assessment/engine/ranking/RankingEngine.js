import prisma from "../../../../config/prisma.js";

export class RankingEngine {
  /**
   * Recalculates and updates the ranks for all COMPLETED attempts within an assessment.
   * This ensures real-time leaderboard accuracy after every submission.
   * 
   * @param {string} assessmentId 
   */
  static async recalculateAssessmentRanks(assessmentId) {
    // 1. Fetch all completed attempts for the assessment
    const attempts = await prisma.assessmentAttempt.findMany({
      where: {
        assessmentId,
        status: "COMPLETED",
        score: { not: null }
      },
      select: {
        id: true,
        score: true,
        efficiency: true,
        decisionSpeed: true, // seconds per move (lower is better)
        startedAt: true,
        completedAt: true
      }
    });

    if (attempts.length === 0) return;

    // 2. Sort attempts
    attempts.sort((a, b) => {
      // Primary: Score (Descending)
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary: Efficiency (Descending)
      if (b.efficiency !== a.efficiency) return (b.efficiency || 0) - (a.efficiency || 0);
      
      // Tertiary: Decision Speed (Ascending, lower is better)
      if (a.decisionSpeed !== b.decisionSpeed) return (a.decisionSpeed || 0) - (b.decisionSpeed || 0);
      
      // Fallback: Time taken overall (Ascending)
      const aTime = a.completedAt && a.startedAt ? new Date(a.completedAt).getTime() - new Date(a.startedAt).getTime() : 0;
      const bTime = b.completedAt && b.startedAt ? new Date(b.completedAt).getTime() - new Date(b.startedAt).getTime() : 0;
      return aTime - bTime;
    });

    // 3. Update DB in a transaction
    const updates = attempts.map((attempt, index) => {
      const rank = index + 1;
      return prisma.assessmentAttempt.update({
        where: { id: attempt.id },
        data: { rank }
      });
    });

    await prisma.$transaction(updates);
  }
}
