

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function UserPhotos( {reload}) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({}); // Lưu comment cho từng ảnh
  const [commentErrors, setCommentErrors] = useState({}); // Lưu lỗi cho từng ảnh

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/photo/${userId}`);
        const data = await res.json();
        setPhotos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi khi tải ảnh người dùng:", err);
        setError("Không thể tải ảnh người dùng.");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [userId, reload]); // Thêm reload vào dependencies để cập nhật khi có thay đổi

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  // Hàm gửi comment cho từng ảnh
  const handleAddComment = async (photoId) => {
    const comment = commentInputs[photoId]?.trim();
    if (!comment) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Comment cannot be empty" }));
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/api/photo/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment }),
      });
      if (res.ok) {
        // Sau khi gửi thành công, load lại danh sách ảnh
        const resPhotos = await fetch(`http://localhost:8081/api/photo/${userId}`);
        const data = await resPhotos.json();
        setPhotos(Array.isArray(data) ? data : []);
        setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
        setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
      } else {
        const err = await res.json();
        setCommentErrors((prev) => ({ ...prev, [photoId]: err.message || "Failed to add comment" }));
      }
    } catch {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Failed to add comment" }));
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="user-photos">
      <h2>User Photos (User ID: {userId})</h2>

      {photos.length === 0 ? (
        <p>Người dùng chưa có ảnh nào.</p>
      ) : (
        photos.map((photo) => (
          <div key={photo._id} className="photo-card">
            <img
              src={`http://localhost:8081/images/${photo.file_name}`}
              alt="User"
              className="photo-img"
            />
            <div className="photo-info">
              <p>
                <strong>Created:</strong> {formatDate(photo.date_time)}
              </p>
              <hr />

              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="photo-comment">
                    <p>
                      <strong>
                        {comment.user ? (
                          <Link to={`/users/${comment.user._id}`}>
                            {comment.user.first_name} {comment.user.last_name}
                          </Link>
                        ) : (
                          "Unknown user"
                        )}
                      </strong>{" "}
                      ({formatDate(comment.date_time)})
                    </p>
                    <p>{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p>Không có bình luận nào.</p>
              )}

              {/* Thêm form nhập comment mới */}
              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[photo._id] || ""}
                  onChange={(e) =>
                    setCommentInputs((prev) => ({
                      ...prev,
                      [photo._id]: e.target.value,
                    }))
                  }
                  style={{ width: "70%" }}
                />
                <button onClick={() => handleAddComment(photo._id)}>Add</button>
              </div>
              {commentErrors[photo._id] && (
                <div style={{ color: "red" }}>{commentErrors[photo._id]}</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserPhotos;