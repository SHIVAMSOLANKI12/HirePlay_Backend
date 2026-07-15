import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/index.js";
import { 
  createOffer, 
  getOffer, 
  getOffers, 
  updateOffer, 
  deleteOffer 
} from "../controllers/offer.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole("COMPANY_ADMIN", "HR"));

router.post("/", createOffer);
router.get("/", getOffers);
router.get("/:offerId", getOffer);
router.patch("/:offerId", updateOffer);
router.delete("/:offerId", deleteOffer);

export default router;
