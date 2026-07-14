/**
 * Formats InterviewFeedback object for API responses.
 * Hides raw Prisma metadata and flattens relations safely.
 */
export const toFeedbackDTO = (feedback) => {
  if (!feedback) return null;

  return {
    id: feedback.id,
    interviewId: feedback.interviewId,
    overallRating: feedback.overallRating,
    recommendation: feedback.recommendation,
    scorecard: {
      technical: feedback.technicalScore,
      communication: feedback.communicationScore,
      problemSolving: feedback.problemSolvingScore,
      cultureFit: feedback.cultureFitScore,
    },
    strengths: feedback.strengths,
    weaknesses: feedback.weaknesses,
    notes: feedback.notes,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
    
    interviewer: feedback.interviewer ? {
      id: feedback.interviewer.id,
      name: feedback.interviewer.name,
      email: feedback.interviewer.email,
    } : undefined,
  };
};
