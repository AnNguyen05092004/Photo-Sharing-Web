const express = require("express");
const router = express.Router();
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const requireLogin = require("../middleware/auth");

// Tìm kiếm users và photos
router.get("/", requireLogin, async (req, res) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");

    // Tìm users theo first_name, last_name, login_name
    const users = await User.find({
      $or: [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { login_name: searchRegex },
      ],
    }).select("_id first_name last_name location occupation");

    // Tìm photos theo caption
    const photos = await Photo.find({ caption: searchRegex })
      .populate("user_id", "_id first_name last_name")
      .select("_id file_name caption date_time user_id likes")
      .limit(20);

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      file_name: photo.file_name,
      caption: photo.caption,
      date_time: photo.date_time,
      likeCount: photo.likes?.length || 0,
      user: photo.user_id,
    }));

    res.json({
      users,
      photos: formattedPhotos,
      query,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
