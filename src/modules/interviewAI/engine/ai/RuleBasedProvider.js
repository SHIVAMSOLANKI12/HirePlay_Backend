import { AIProvider } from "./AIProvider.interface.js";

export class RuleBasedProvider extends AIProvider {
  async analyzeInterview(sessionData, scorecards = [], metadata = {}) {
    if (!scorecards || scorecards.length === 0) {
      throw new Error("Cannot perform AI Analysis without submitted scorecards.");
    }

    // 1. Calculate overall score average
    let totalScoreSum = 0;
    const strengthsSet = new Set();
    const weaknessesSet = new Set();
    const recommendationsCount = {};

    scorecards.forEach(sc => {
      totalScoreSum += Number(sc.overallScore) || 0;
      if (sc.recommendation) {
        recommendationsCount[sc.recommendation] = (recommendationsCount[sc.recommendation] || 0) + 1;
      }
      if (sc.feedback) {
        (sc.feedback.strengths || []).forEach(s => strengthsSet.add(s));
        (sc.feedback.weaknesses || []).forEach(w => weaknessesSet.add(w));
      }
    });

    const averageScore = Math.round((totalScoreSum / scorecards.length) * 100) / 100;

    // 2. Determine Overall Consensus Recommendation
    let overallRecommendation = "BORDERLINE";
    let maxCount = 0;
    Object.keys(recommendationsCount).forEach(rec => {
      if (recommendationsCount[rec] > maxCount) {
        maxCount = recommendationsCount[rec];
        overallRecommendation = rec;
      }
    });

    if (averageScore >= 85) overallRecommendation = "STRONG_HIRE";
    else if (averageScore >= 70) overallRecommendation = "HIRE";
    else if (averageScore >= 55) overallRecommendation = "BORDERLINE";
    else if (averageScore >= 40) overallRecommendation = "HOLD";
    else overallRecommendation = "REJECT";

    // 3. Compute Confidence Score & Reason
    const confidenceScore = Math.min(95, 60 + scorecards.length * 10);
    const confidenceReason = `Confidence calculated at ${confidenceScore}% based on ${scorecards.length} submitted interviewer scorecard(s) with ${averageScore}% average score consistency.`;

    // 4. Generate Summaries
    const candidateName = sessionData.participants?.find(p => p.role === "CANDIDATE")?.name || "The candidate";
    const candidateSummary = `${candidateName} demonstrated a cumulative evaluation score of ${averageScore}% across ${scorecards.length} interviewer round(s). Key evaluation focus was on technical aptitude and role alignment.`;
    const interviewSummary = `Interview session titled "${sessionData.title}" completed with ${scorecards.length} submitted evaluation scorecard(s). Consensus outcome: ${overallRecommendation}.`;

    const technicalAnalysis = averageScore >= 75
      ? `${candidateName} displays strong technical domain proficiency with clear problem-solving methodologies.`
      : `${candidateName} shows foundational technical understanding but may require additional domain mentoring.`;

    const communicationAnalysis = Array.from(strengthsSet).some(s => s.toLowerCase().includes("communication"))
      ? "Demonstrates clear, articulate, and effective communication skills."
      : "Communication was adequate during technical discussions.";

    const problemSolvingAnalysis = averageScore >= 70
      ? "Demonstrates structured analytical thinking and effective problem-solving skills."
      : "Shows potential in problem-solving with room for improvement in edge-case handling.";

    // 5. Generate Risks & Severities
    const risks = [];
    if (averageScore < 60) {
      risks.push({
        riskType: "Technical Risk",
        severity: "HIGH",
        description: "Overall technical evaluation score is below 60%.",
        mitigation: "Recommend conducting an extra technical screening round or pair-programming task."
      });
    }
    if (weaknessesSet.size > 0) {
      risks.push({
        riskType: "Skill Mismatch Risk",
        severity: averageScore < 70 ? "MEDIUM" : "LOW",
        description: `Identified potential improvement areas: ${Array.from(weaknessesSet).slice(0, 2).join(", ")}.`,
        mitigation: "Provide structured onboarding and mentor support during the first 90 days."
      });
    }
    if (risks.length === 0) {
      risks.push({
        riskType: "Confidence Risk",
        severity: "LOW",
        description: "No critical risks identified during interviewer evaluations.",
        mitigation: "Proceed with standard offer workflow."
      });
    }

    // 6. Generate Recommendations & Insights
    const topStrengths = Array.from(strengthsSet).length > 0 ? Array.from(strengthsSet) : ["Technical Domain Aptitude", "Problem Solving"];
    const topWeaknesses = Array.from(weaknessesSet).length > 0 ? Array.from(weaknessesSet) : ["Needs further practice in system design edge cases"];
    const improvementAreas = ["System Design Optimization", "Database Query Tuning"];
    const recommendedTraining = ["Advanced Architecture Best Practices", "Team Leadership Workshop"];

    const recommendations = [
      {
        category: "Hiring Decision",
        recommendation: overallRecommendation,
        justification: `Based on an average score of ${averageScore}% and consensus recommendation from ${scorecards.length} interviewer(s).`
      },
      {
        category: "Role Leveling",
        recommendation: averageScore >= 80 ? "Senior Level" : "Mid Level",
        justification: `Evaluation scores align with ${averageScore >= 80 ? "Senior" : "Mid"} level expectations.`
      }
    ];

    return {
      overallRecommendation,
      confidenceScore,
      confidenceReason,
      summary: {
        candidateSummary,
        interviewSummary,
        technicalAnalysis,
        communicationAnalysis,
        problemSolvingAnalysis,
        leadershipAnalysis: "Displays collaborative team leadership potential.",
        cultureFitAnalysis: "Values align well with company culture and collaboration standards."
      },
      insights: {
        topStrengths,
        topWeaknesses,
        improvementAreas,
        recommendedTraining,
        suggestedNextFocus: averageScore >= 75 ? "Proceed to Offer Stage" : "Conduct follow-up technical assessment",
        hiringReadinessScore: averageScore
      },
      risks,
      recommendations
    };
  }
}
