export class AssessmentMapper {
  static toDto(assessment) {
    if (!assessment) return null;
    return {
      id: assessment.id,
      companyId: assessment.companyId,
      title: assessment.title,
      description: assessment.description,
      status: assessment.status,
      createdBy: assessment.createdBy,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
      scoringProfile: assessment.scoringProfile,
      games: assessment.games ? assessment.games.map(g => AssessmentMapper.toGameDto(g)) : [],
    };
  }

  static toGameDto(game) {
    if (!game) return null;
    return {
      id: game.id,
      assessmentId: game.assessmentId,
      gameType: game.gameType,
      difficulty: game.difficulty,
      timeLimitMs: game.timeLimitMs,
      config: game.config,
    };
  }
}
