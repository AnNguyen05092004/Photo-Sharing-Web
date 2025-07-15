import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData"; // Hàm fetchModel có sẵn

import "./styles.css"; // Tạo CSS riêng

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/user/list", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setUsers([]);
    }
  };

    fetchUsers();
  }, []);

  return (
    <div className="user-list-container">
      <h3>List of Users</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id} className="user-list-item">
            <Link to={`/users/${user._id}`} className="user-link">
              {user.first_name} {user.last_name}
            </Link>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
