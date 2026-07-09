import { Router } from "express";

import { createCompany } from "../controllers/createCompany.controller.js";

import { requireAuth } from "../../../middleware/requireAuth.middleware.js";

import { createCompanySchema } from "../validations/createCompany.validation.js";
import { getCompany } from "../controllers/getCompany.controller.js";
import { updateCompany } from "../controllers/updateCompany.controller.js";
import { deleteCompany } from "../controllers/deleteCompany.controller.js";
import { uploadCompanyLogo } from "../controllers/uploadCompanyLogo.controller.js";
import { companyLogoUploadMiddleware } from "../../../middleware/companyLogoUpload.middleware.js";
import { getCompanySettings } from "../controllers/getCompanySettings.controller.js";
import { updateCompanySettings } from "../controllers/updateCompanySettings.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  createCompany
);

router.get(
  "/me",
  requireAuth,
  getCompany
);

router.patch(
  "/",
  requireAuth,
  updateCompany
);

router.delete(
  "/",
  requireAuth,
  deleteCompany
);

router.patch(
  "/logo",
  requireAuth,
  companyLogoUploadMiddleware,
  uploadCompanyLogo
);

router.get(
  "/settings",
  requireAuth,
  getCompanySettings
);

router.patch(
  "/settings",
  requireAuth,
  updateCompanySettings
);

export default router;