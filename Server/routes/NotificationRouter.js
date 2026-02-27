const express = require("express");
const router = express.Router();
const Notification = require("../db/notificationModel");
const requireLogin = require("../middleware/auth");

// Lấy danh sách thông báo của user hiện tại
router.get("/", requireLogin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user_id: req.session.user._id })
      .sort({ date_time: -1 })
      .skip(skip)
      .limit(limit)
      .populate("from_user_id", "_id first_name last_name")
      .populate("photo_id", "_id file_name");

    const total = await Notification.countDocuments({ user_id: req.session.user._id });
    const unreadCount = await Notification.countDocuments({ 
      user_id: req.session.user._id, 
      read: false 
    });

    res.json({
      notifications,
      total,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Đánh dấu thông báo đã đọc
router.put("/:id/read", requireLogin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }
    notification.read = true;
    await notification.save();
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Đánh dấu tất cả thông báo đã đọc
router.put("/read-all", requireLogin, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.session.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Xóa thông báo
router.delete("/:id", requireLogin, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.user_id.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({ message: "Permission denied" });
    }
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
