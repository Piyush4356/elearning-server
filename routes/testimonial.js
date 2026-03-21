import express from "express";
import { addTestimonial, getTestimonials } from "../controllers/testimonial.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/testimonial/add", isAuth, addTestimonial);
router.get("/testimonials", getTestimonials);

export default router;
