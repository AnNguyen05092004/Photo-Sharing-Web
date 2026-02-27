const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const Notification = require("../db/notificationModel");
const requireLogin = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET photos of a user with pagination
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID");
    }

    const user = await User.findById(userId).select("_id");
    if (!user) {
      return res.status(404).send("User not found");
    }

    const totalPhotos = await Photo.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalPhotos / limit);

    const photos = await Photo.find({ user_id: userId })
      .sort({ date_time: -1 })
      .skip(skip)
      .limit(limit)
      .populate("comments.user_id")
      .populate("comments.replies.user_id");

    const formattedPhotos = photos.map((photo) => ({
      _id: photo._id,
      file_name: photo.file_name,
      caption: photo.caption || "",
      date_time: photo.date_time,
      user_id: photo.user_id,
      likes: photo.likes || [],
      likeCount: photo.likes ? photo.likes.length : 0,
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
        replies: (comment.replies || []).map((reply) => ({
          _id: reply._id,
          comment: reply.comment,
          date_time: reply.date_time,
          user: reply.user_id
            ? {
                _id: reply.user_id._id,
                first_name: reply.user_id.first_name,
                last_name: reply.user_id.last_name,
              }
            : null,
        })),
      })),
    }));

    res.json({
      photos: formattedPhotos,
      currentPage: page,
      totalPages,
      totalPhotos,
    });
  } catch (err) {
    console.error("ERROR in /api/photo/:id", err);
    res.status(500).send(`Server Error: ${err.message}`);
  }
});

// POST comment on a photo
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
      replies: [],
    };
    photo.comments.push(newComment);
    await photo.save();
    
    // Tạo notification cho chủ ảnh (nếu không phải chính mình)
    if (photo.user_id.toString() !== req.session.user._id.toString()) {
      await Notification.create({
        user_id: photo.user_id,
        from_user_id: req.session.user._id,
        type: "comment",
        photo_id: photo._id,
        content: comment.substring(0, 100),
      });
    }
    
    res.status(200).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST reply to a comment
router.post("/:photo_id/comments/:comment_id/reply", requireLogin, async (req, res) => {
  const { comment } = req.body;
  if (!comment || !comment.trim()) {
    return res.status(400).json({ message: "Reply cannot be empty" });
  }
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const parentComment = photo.comments.id(req.params.comment_id);
    if (!parentComment) return res.status(404).json({ message: "Comment not found" });

    const newReply = {
      comment,
      user_id: req.session.user._id,
      date_time: new Date(),
    };
    parentComment.replies.push(newReply);
    await photo.save();
    
    // Tạo notification cho người viết comment gốc (nếu không phải chính mình)
    if (parentComment.user_id.toString() !== req.session.user._id.toString()) {
      await Notification.create({
        user_id: parentComment.user_id,
        from_user_id: req.session.user._id,
        type: "reply",
        photo_id: photo._id,
        comment_id: parentComment._id,
        content: comment.substring(0, 100),
      });
    }
    
    res.status(200).json(newReply);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST like/unlike a photo (toggle)
router.post("/:photo_id/like", requireLogin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const userId = req.session.user._id;
    const alreadyLiked = photo.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      photo.likes = photo.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      photo.likes.push(userId);
      
      // Tạo notification cho chủ ảnh khi có like mới (không phải unlike, và không phải chính mình)
      if (photo.user_id.toString() !== userId.toString()) {
        await Notification.create({
          user_id: photo.user_id,
          from_user_id: userId,
          type: "like",
          photo_id: photo._id,
        });
      }
    }

    await photo.save();
    res.status(200).json({
      likes: photo.likes,
      likeCount: photo.likes.length,
      liked: !alreadyLiked,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT update photo caption
router.put("/:photo_id/caption", requireLogin, async (req, res) => {
  try {
    const { caption } = req.body;
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }

    photo.caption = caption || "";
    await photo.save();
    res.status(200).json({ message: "Caption updated", caption: photo.caption });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE a photo (only owner can delete)
router.delete("/:photo_id", requireLogin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Delete image file from disk
    const imagePath = path.join(__dirname, "../images/", photo.file_name);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Photo.findByIdAndDelete(req.params.photo_id);
    res.status(200).json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE a comment (only comment owner can delete)
router.delete("/:photo_id/comments/:comment_id", requireLogin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const comment = photo.comments.id(req.params.comment_id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }

    photo.comments.pull({ _id: req.params.comment_id });
    await photo.save();
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE a reply (only reply owner can delete)
router.delete("/:photo_id/comments/:comment_id/replies/:reply_id", requireLogin, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    const comment = photo.comments.id(req.params.comment_id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(req.params.reply_id);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    if (reply.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }

    comment.replies.pull({ _id: req.params.reply_id });
    await photo.save();
    res.status(200).json({ message: "Reply deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
