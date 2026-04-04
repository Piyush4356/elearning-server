import express from "express";
import { submitSupportRequest, testSupportEmail } from "../controllers/support.js";

const router = express.Router();

// GET  /api/support/test — open in browser to verify email works
router.get("/support/test", testSupportEmail);

// POST /api/support — Lexi chatbot support email handler
router.post("/support", submitSupportRequest);

export default router;
