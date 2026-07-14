import AppError from "../../../utils/AppError.js";

export const verifyCandidateOwnership = async (resourceId, candidateId, fetchFn, resourceName = "Resource") => {
  const resource = await fetchFn(resourceId);
  
  if (!resource) {
    throw new AppError(`${resourceName} not found`, 404);
  }

  if (resource.candidateId !== candidateId) {
    throw new AppError(`${resourceName} not found`, 404); // Return 404 instead of 403 to prevent resource leaking
  }

  return resource;
};
