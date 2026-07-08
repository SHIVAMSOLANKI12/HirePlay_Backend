import express from "express";
import { logoutAll } from "../controllers/logoutAll.controller.js";

const router = express.Router();

router.post("/logout-all", logoutAll);

export default router;