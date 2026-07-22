export class InterviewScorecardMapper {
  static toDto(scorecard) {
    if (!scorecard) return null;

    return {
      id: scorecard.id,
      companyId: scorecard.companyId,
      sessionId: scorecard.sessionId,
      interviewerId: scorecard.interviewerId,
      interviewerName: scorecard.interviewer ? scorecard.interviewer.name : null,
      candidateId: scorecard.candidateId,
      candidateName: scorecard.candidate ? scorecard.candidate.name : null,
      title: scorecard.title,
      status: scorecard.status,
      overallScore: scorecard.overallScore,
      recommendation: scorecard.recommendation,
      recommendationReason: scorecard.recommendationReason,
      submittedAt: scorecard.submittedAt,
      reopenedAt: scorecard.reopenedAt,
      scores: scorecard.scores ? scorecard.scores.map(InterviewScorecardMapper.toScoreDto) : [],
      feedback: InterviewScorecardMapper.toFeedbackDto(scorecard.feedback),
      createdAt: scorecard.createdAt,
      updatedAt: scorecard.updatedAt
    };
  }

  static toScoreDto(scoreItem) {
    if (!scoreItem) return null;
    return {
      id: scoreItem.id,
      criterionName: scoreItem.criterionName,
      score: scoreItem.score,
      maxScore: scoreItem.maxScore,
      weight: scoreItem.weight,
      comments: scoreItem.comments
    };
  }

  static toFeedbackDto(feedback) {
    if (!feedback) return null;
    return {
      id: feedback.id,
      strengths: feedback.strengths || [],
      weaknesses: feedback.weaknesses || [],
      detailedNotes: feedback.detailedNotes,
      privateFeedback: feedback.privateFeedback,
      candidateVisibleNotes: feedback.candidateVisibleNotes
    };
  }
}
