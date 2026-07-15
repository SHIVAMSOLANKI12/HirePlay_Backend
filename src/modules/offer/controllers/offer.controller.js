import { successResponse } from "../../../utils/apiResponse.js";
import { createOfferSchema, updateOfferSchema } from "../validations/offer.validation.js";
import { createOfferWorkflow } from "../workflows/createOffer.workflow.js";
import { getOfferWorkflow } from "../workflows/getOffer.workflow.js";
import { getOffersWorkflow } from "../workflows/getOffers.workflow.js";
import { updateOfferWorkflow } from "../workflows/updateOffer.workflow.js";
import { deleteOfferWorkflow } from "../workflows/deleteOffer.workflow.js";
import { approveOfferWorkflow } from "../workflows/approveOffer.workflow.js";
import { sendOfferWorkflow } from "../workflows/sendOffer.workflow.js";
import { getOfferWorkflowDetails } from "../workflows/getOfferWorkflow.workflow.js";
import { revokeOfferWorkflow } from "../workflows/revokeOffer.workflow.js";
import { getOfferStatusWorkflow } from "../workflows/getOfferStatus.workflow.js";

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

export const approveOffer = async (req, res, next) => {
  try {
    const result = await approveOfferWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer approved successfully");
  } catch (error) {
    next(error);
  }
};

export const sendOffer = async (req, res, next) => {
  try {
    const result = await sendOfferWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer sent successfully");
  } catch (error) {
    next(error);
  }
};

export const getOfferWorkflowData = async (req, res, next) => {
  try {
    const result = await getOfferWorkflowDetails(req.user, req.params.offerId);
    return successResponse(res, result, "Offer workflow retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const revokeOffer = async (req, res, next) => {
  try {
    const result = await revokeOfferWorkflow(req.user, req.params.offerId, req.body);
    return successResponse(res, result, "Offer revoked successfully");
  } catch (error) {
    next(error);
  }
};

export const getOfferStatus = async (req, res, next) => {
  try {
    const result = await getOfferStatusWorkflow(req.user, req.params.offerId);
    return successResponse(res, result, "Offer status retrieved successfully");
  } catch (error) {
    next(error);
  }
};
