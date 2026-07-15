import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/index.js";
import { 
  createOffer, 
  getOffer, 
  getOffers, 
  updateOffer, 
  deleteOffer,
  approveOffer,
  sendOffer,
  getOfferWorkflowData
} from "../controllers/offer.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("COMPANY_ADMIN", "HR"));

router.post("/", createOffer);
router.get("/", getOffers);
router.get("/:offerId", getOffer);
router.patch("/:offerId", updateOffer);
router.delete("/:offerId", deleteOffer);

// Workflow routes
router.patch("/:offerId/approve", requireRole("COMPANY_ADMIN"), approveOffer);
router.patch("/:offerId/send", sendOffer); // Requires COMPANY_ADMIN or HR, which is enforced by route base
router.get("/:offerId/workflow", getOfferWorkflowData);

export default router;
