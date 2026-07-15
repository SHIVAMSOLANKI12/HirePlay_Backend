import { successResponse } from "../../../utils/apiResponse.js";
import { createOfferSchema, updateOfferSchema } from "../validations/offer.validation.js";
import { createOfferWorkflow } from "../workflows/createOffer.workflow.js";
import { getOfferWorkflow } from "../workflows/getOffer.workflow.js";
import { getOffersWorkflow } from "../workflows/getOffers.workflow.js";
import { updateOfferWorkflow } from "../workflows/updateOffer.workflow.js";
import { deleteOfferWorkflow } from "../workflows/deleteOffer.workflow.js";

export const createOffer = async (req, res, next) => {
  try {
    const validatedData = createOfferSchema.parse({ body: req.body }).body;
    const result = await createOfferWorkflow(req.user, validatedData);
    return successResponse(res, result, "Offer created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      jobId: req.query.jobId
    };
    const result = await getOffersWorkflow(req.user, filters);
    return successResponse(res, result, "Offers retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getOffer = async (req, res, next) => {
  try {
    const result = await getOfferWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (req, res, next) => {
  try {
    const validatedData = updateOfferSchema.parse({ 
      params: req.params,
      body: req.body 
    }).body;
    
    const result = await updateOfferWorkflow(req.user, req.params.offerId, validatedData);
    return successResponse(res, result, "Offer updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (req, res, next) => {
  try {
    const result = await deleteOfferWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer deleted successfully");
  } catch (error) {
    next(error);
  }
};
