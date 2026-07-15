import { successResponse } from "../../../utils/apiResponse.js";
import { getCandidateOffersWorkflow } from "../workflows/getCandidateOffers.workflow.js";
import { getCandidateOfferWorkflow } from "../workflows/getCandidateOffer.workflow.js";
import { acceptOfferWorkflow } from "../workflows/acceptOffer.workflow.js";
import { rejectOfferWorkflow } from "../workflows/rejectOffer.workflow.js";

export const getCandidateOffers = async (req, res, next) => {
  try {
    const result = await getCandidateOffersWorkflow(req.user);
    return successResponse(res, result, "Candidate offers retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getCandidateOffer = async (req, res, next) => {
  try {
    const result = await getCandidateOfferWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const acceptOffer = async (req, res, next) => {
  try {
    // Basic validation could be done via Zod if needed, but we extract from req.body directly
    const result = await acceptOfferWorkflow(req.user, req.params.offerId, req.body);
    return successResponse(res, result, "Offer accepted successfully");
  } catch (error) {
    next(error);
  }
};

export const rejectOffer = async (req, res, next) => {
  try {
    const result = await rejectOfferWorkflow(req.user, req.params.offerId, req.body);
    return successResponse(res, result, "Offer rejected successfully");
  } catch (error) {
    next(error);
  }
};
