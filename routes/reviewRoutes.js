import express from "express";
import Review from "../model/Review.js";

const router = express.Router();

// Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Post a new review
router.post("/", async (req, res) => {
  try {
    const { name, text } = req.body;
    const newReview = new Review({ name, text });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: "Error saving review" });
  }
});

// Delete review (for admin panel)
router.delete("/:id", async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting review" });
  }
});

export default router;
