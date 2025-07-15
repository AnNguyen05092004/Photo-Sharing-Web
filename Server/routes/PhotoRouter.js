const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const requireLogin = require("../middleware/auth");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
      return res.status(404).send("User not found");
    }

    const photos = await Photo.find({ user_id: userId }).populate(
      "comments.user_id"
    );

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: comment.user_id
          ? {
              _id: comment.user_id._id,
              first_name: comment.user_id.first_name,
              last_name: comment.user_id.last_name,
            }
          : null,
      })),
    }));

    res.json(formattedPhotos);
  } catch (err) {
    console.error("ERROR in /api/photo/:id", err);
    res.status(500).send(`Server Error: ${err.message}`);
  }
});

router.post("/commentsOfPhoto/:photo_id", requireLogin, async (req, res) => {
  const { comment } = req.body;
  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const newComment = {
      comment,
      user_id: req.session.user._id,
      date_time: new Date(),
    };
    photo.comments.push(newComment);
    await photo.save();
    res.status(200).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
