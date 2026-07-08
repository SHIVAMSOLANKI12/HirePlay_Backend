import express from "express";
import { getCurrentUser } from "../controllers/me.controller.js";
import { requireAuth } from "../../../middleware/requireAuth.middleware.js";

const router = express.Router();

router.get("/me", requireAuth, getCurrentUser);

export default router;
