import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";

import Owner from "./model/Owner.js";
import Room from "./model/Room.js";
import Review from "./model/Review.js"; // ✅ Add this

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ---------------------
// MONGO CONNECTION
// ---------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ---------------------
// ROOMS
// ---------------------
app.get("/api/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.put("/api/rooms/:id/price", async (req, res) => {
  try {
    const { price } = req.body;
    if (!price) return res.status(400).json({ error: "Price is required" });

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { price },
      { new: true }
    );

    if (!updatedRoom) return res.status(404).json({ error: "Room not found" });

    res.json(updatedRoom);
  } catch (err) {
    console.error("Error updating price:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// OWNER INFO (MULTIPLE, IMAGE UPLOAD)
// ---------------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
app.use("/uploads", express.static("uploads"));

// GET all owners
app.get("/api/owner", async (req, res) => {
  try {
    const owners = await Owner.find();
    res.json(owners);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST new owner
app.post("/api/owner", upload.single("image"), async (req, res) => {
  try {
    const { name, info } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newOwner = new Owner({ name, info, image });
    await newOwner.save();

    res.json(newOwner);
  } catch (err) {
    console.error("Error saving owner:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE specific owner by ID
app.delete("/api/owner/:id", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ error: "Owner not found" });

    // Delete image file if exists
    if (owner.image) {
      const filePath = path.join("./", owner.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Owner.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// REVIEWS (ADD, GET, DELETE)
// ---------------------

// ✅ Get all reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Post a new review
app.post("/api/reviews", async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text)
      return res.status(400).json({ error: "Name and text are required" });

    const newReview = new Review({ name, text });
    await newReview.save();

    res.status(201).json(newReview);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Optional: Delete a review
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    await Review.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------
// START SERVER
// ---------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
