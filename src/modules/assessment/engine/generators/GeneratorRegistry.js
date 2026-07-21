import { LogicPuzzleGenerator } from "./LogicPuzzleGenerator.js";
import AppError from "../../../../utils/AppError.js";

/**
 * GeneratorRegistry
 * Factory pattern to resolve the correct generator for a specific Game Type.
 */
export class GeneratorRegistry {
  static getGenerator(gameType) {
    switch (gameType) {
      case "LOGIC_CIRCUIT":
      case "PATH_OPTIMIZATION":
      case "RESOURCE_ALLOCATION":
        return new LogicPuzzleGenerator(); // Currently mocking all with the Logic Generator
      default:
        throw new AppError(`No puzzle generator registered for game type: ${gameType}`, 400);
    }
  }
}
