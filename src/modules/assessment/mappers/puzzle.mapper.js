export class PuzzleMapper {
  /**
   * Maps a GameSeed (Puzzle) object to a client-safe DTO.
   * CRITICAL: Always strip the hiddenSolution before returning.
   */
  static toCandidateDto(seed) {
    if (!seed) return null;
    
    return {
      id: seed.id,
      assessmentId: seed.assessmentId,
      gameType: seed.gameType,
      difficulty: seed.difficulty,
      seedData: seed.seedData, 
      // STRICTLY EXCLUDING: hiddenSolution, hash, version
      metadata: seed.metadata,
      createdAt: seed.createdAt
    };
  }

  static toAdminDto(seed) {
    if (!seed) return null;
    
    return {
      id: seed.id,
      assessmentId: seed.assessmentId,
      candidateId: seed.candidateId,
      gameType: seed.gameType,
      difficulty: seed.difficulty,
      seedData: seed.seedData,
      hash: seed.hash,
      version: seed.version,
      metadata: seed.metadata,
      isUsed: seed.isUsed,
      createdAt: seed.createdAt
      // STRICTLY EXCLUDING: hiddenSolution (even admins shouldn't see it in plain APIs unless specifically requested)
    };
  }
}
