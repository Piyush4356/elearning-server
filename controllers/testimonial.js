import { Testimonial } from "../models/Testimonial.js";

// @desc    Add a testimonial
// @route   POST /api/testimonials
export const addTestimonial = async (req, res) => {
  try {
    const { message, position } = req.body;
    
    const newTestimonial = await Testimonial.create({
      name: req.user.name,
      position: position || "Student",
      message,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Testimonial added successfully!",
      testimonial: newTestimonial,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all testimonials
// @route   GET /api/testimonials
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate("user", "image name")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
