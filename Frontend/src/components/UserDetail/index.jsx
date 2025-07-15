import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/user/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Không tìm thấy người dùng.");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin người dùng:", err);
        setError("Không tìm thấy người dùng.");
      }
    };

    fetchUser();
  }, [userId]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (!user) {
    return <div className="loader">Đang tải...</div>;
  }

  return (
    <div className="user-detail-container">
      <h2>User Details</h2>
      <p>
        <strong>First Name:</strong> {user.first_name}
      </p>
      <p>
        <strong>Last Name:</strong> {user.last_name}
      </p>
      <p>
        <strong>Location:</strong> {user.location}
      </p>
      <p>
        <strong>Description:</strong> {user.description}
      </p>
      <p>
        <strong>Occupation:</strong> {user.occupation}
      </p>

      <Link to={`/photos/${userId}`} className="view-photos-button">
        View Photos
      </Link>
    </div>
  );
}

export default UserDetail;
