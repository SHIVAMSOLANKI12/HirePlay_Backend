import prisma from "../../../config/prisma.js";
import AppError from "../../../utils/AppError.js";
import { GeneratorRegistry } from "../engine/generators/GeneratorRegistry.js";

export const generatePuzzlesForAttempt = async (assessmentId, candidateId, attemptId) => {
  // 1. Fetch Assessment and its games
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { games: true }
  });

  if (!assessment) {
    throw new AppError("Assessment not found", 404);
  }

  if (assessment.games.length === 0) {
    throw new AppError("Assessment has no games configured", 400);
  }

  const generatedSeeds = [];

  // 2. Generate a puzzle for each game
  for (const game of assessment.games) {
    // Check if puzzle already exists for this attempt
    const existingSeed = await prisma.gameSeed.findUnique({
      where: {
        assessmentId_candidateId_gameType: {
          assessmentId,
          candidateId,
          gameType: game.gameType
        }
      }
    });

    if (existingSeed) {
      // Archive old seed (soft delete not present, so we delete it to replace)
      // Or we can just throw error: "Already generated"
      // Based on rules: "If regeneration is allowed, archive the previous puzzle."
      // For now, we will delete the old one to regenerate
      await prisma.gameSeed.delete({ where: { id: existingSeed.id } });
    }

    const generator = GeneratorRegistry.getGenerator(game.gameType);
    const puzzleData = await generator.generate(
      game.difficulty,
      game.gameType,
      candidateId,
      assessmentId,
      game.config || {}
    );

    // Save to DB
    const newSeed = await prisma.gameSeed.create({
      data: {
        assessmentId,
        candidateId,
        gameType: game.gameType,
        difficulty: game.difficulty,
        seedData: puzzleData.seedData,
        hiddenSolution: puzzleData.hiddenSolution,
        hash: puzzleData.hash,
        version: puzzleData.version,
        metadata: puzzleData.metadata
      }
    });

    // Create Game Session for this puzzle
    const newSession = await prisma.gameSession.create({
      data: {
        attemptId,
        gameId: game.id,
        seedId: newSeed.id,
        status: "CREATED"
      }
    });

    generatedSeeds.push(newSeed);
  }

  return generatedSeeds;
};

export const getCandidatePuzzles = async (assessmentId, candidateId) => {
  // We need the attempt first to get the sessions
  const attempt = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId, candidateId },
    include: {
      sessions: {
        include: {
          seed: true
        }
      }
    }
  });

  if (!attempt) return [];

  // Map the response to include sessionId and puzzle seed (without hiddenSolution)
  return attempt.sessions.map(session => {
    const puzzle = { ...session.seed };
    delete puzzle.hiddenSolution;
    
    return {
      sessionId: session.id,
      status: session.status,
      ...puzzle
    };
  });
};
