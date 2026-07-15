import { Router } from "express";
import { requireAuth, requireRole } from "../../../middleware/index.js";
import { 
  getCandidateOffers, 
  getCandidateOffer, 
  acceptOffer, 
  rejectOffer 
} from "../controllers/candidateOffer.controller.js";

const router = Router();

// Candidate endpoints (Role CANDIDATE is enforced here)
router.use(requireAuth);
router.use(requireRole("CANDIDATE"));

router.get("/", getCandidateOffers);
router.get("/:offerId", getCandidateOffer);
router.patch("/:offerId/accept", acceptOffer);
router.patch("/:offerId/reject", rejectOffer);

export default router;
