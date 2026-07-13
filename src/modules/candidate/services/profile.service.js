import AppError from "../../../utils/AppError.js";
import {
  findCandidateById,
  updateCandidateProfile,
} from "../repositories/candidate.repository.js";

export const getCandidateProfileService = async (candidateId) => {
  const candidate = await findCandidateById(candidateId);
  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }
  return candidate;
};

export const updateCandidateProfileService = async (candidateId, data) => {
  // data is already validated to only include allowed fields (e.g., name)
  const candidate = await findCandidateById(candidateId);
  if (!candidate) {
    throw new AppError("Candidate not found", 404);
  }

  const updatedCandidate = await updateCandidateProfile(candidateId, data);
  return updatedCandidate;
};
