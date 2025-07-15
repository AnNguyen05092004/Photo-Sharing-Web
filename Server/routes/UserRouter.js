const express = require("express");
const User = require("../db/userModel");
const router = express.Router();
const requireLogin = require("../middleware/auth")

// router.post("/", async (request, response) => {

// });

router.get("/list", requireLogin, async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );
    if (!user) return res.status(400).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(400).send("Invalid ID");
  }
});

// API cập nhật thông tin user
router.put("/:id", requireLogin, async (req, res) => {
  try {
    const { first_name, last_name, location, description, occupation } = req.body;
    // Chỉ cho phép user tự sửa thông tin của mình
    if (req.session.user._id !== req.params.id) {
      return res.status(403).json({ message: "Permission denied" });
    }
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { first_name, last_name, location, description, occupation },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.post("/", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("login_name, password, first_name, last_name are required.");
  }
  if (typeof password !== "string" || password.trim() === "") {
    return res.status(400).send("Password must be a non-empty string.");
  }
  const existing = await User.findOne({ login_name });
  if (existing) {
    return res.status(400).send("login_name already exists.");
  }
  const user = new User({
    login_name,
    password, // (Có thể hash nếu muốn bảo mật hơn)
    first_name,
    last_name,
    location,
    description,
    occupation,
  });
  await user.save();
  res.status(200).json({ login_name: user.login_name, first_name, last_name });
});

module.exports = router;
