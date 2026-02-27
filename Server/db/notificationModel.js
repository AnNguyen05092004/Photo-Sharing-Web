const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  // User nhận thông báo
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  // User gây ra thông báo
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  // Loại thông báo: 'like', 'comment', 'reply'
  type: { type: String, enum: ["like", "comment", "reply"], required: true },
  // ID của photo liên quan
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photos" },
  // ID của comment liên quan (nếu là reply)
  comment_id: { type: mongoose.Schema.Types.ObjectId },
  // Nội dung preview (vd: nội dung comment)
  content: { type: String },
  // Đã đọc chưa
  read: { type: Boolean, default: false },
  // Thời gian tạo
  date_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notifications", notificationSchema);
