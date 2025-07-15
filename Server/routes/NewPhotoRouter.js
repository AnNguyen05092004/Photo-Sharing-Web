const express = require("express");
const multer = require("multer");
const path = require("path");
const requireLogin = require("../middleware/auth");
const Photo = require("../db/photoModel");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) { // chỉ định thư mục lưu file ảnh:
    cb(null, path.join(__dirname, "../images/"));
  },
  filename: function (req, file, cb) { // tạo tên file duy nhất để tránh trùng lặp:
    const uniqueName = Date.now() + "_" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage }); // cấu hình multer để sử dụng storage đã định nghĩa

router.post("/photos/new", requireLogin, upload.single("photo"), async (req, res) => {
  // upload.single("photo") sẽ lấy file từ form-data với key là "photo"
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user._id,
      comments: [],
    });
    await newPhoto.save();
    res.status(200).json(newPhoto);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;