import React, { useRef, useEffect, useState } from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import "./styles.css";

function TopBar({ loggedInUser, setLoggedInUser, setIsLoggedIn, onPhotoUploaded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [pageUser, setPageUser] = useState(null);

  // Lấy userId trên URL nếu có
  useEffect(() => {
    const fetchPageUser = async () => {
      const match =
        matchPath({ path: "/users/:userId" }, location.pathname) ||
        matchPath({ path: "/photos/:userId" }, location.pathname);
      const userId = match?.params?.userId;

      if (userId) {
        try {
          const res = await fetch(`http://localhost:8081/api/user/${userId}`);
          const data = await res.json();
          setPageUser(data);
        } catch (error) {
          setPageUser(null);
        }
      } else {
        setPageUser(null);
      }
    };

    fetchPageUser();
  }, [location]);

  // Xác định label trung tâm
  let centerContent = "Welcome to PhotoShare";
  if (location.pathname.startsWith("/photos") && pageUser) {
    centerContent = `Photos of ${pageUser.first_name} ${pageUser.last_name}`;
  } else if (location.pathname.startsWith("/users") && pageUser) {
    centerContent = `${pageUser.first_name} ${pageUser.last_name}`;
  }

  const handleLogout = async () => {
    await fetch("http://localhost:8081/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setLoggedInUser(null);
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("http://localhost:8081/api/photos/new", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (res.ok) {
      if (onPhotoUploaded) onPhotoUploaded();
      alert("Photo uploaded!");
    } else {
      alert("Upload failed!");
    }
    e.target.value = "";
  };

  return (
    <header className="topbar">
      <div className="topbar-content" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        fontWeight: 500
      }}>
        {/* Left: tên user đăng nhập */}
        <div style={{ flex: 1, textAlign: "left" }}>
          {loggedInUser ? `Hi, ${loggedInUser.first_name}` : "Please Login"}
        </div>

        {/* Center: label */}
        <div style={{ flex: 2, textAlign: "center" }}>
          {centerContent}
        </div>

        {/* Right: các nút chức năng và label Nguyễn Văn An */}
        <div style={{ flex: 1, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          {loggedInUser && (
            <>
              <button
                onClick={() => navigate(`/users/${loggedInUser._id}/edit`)}
                style={{ padding: "4px 12px" }}
              >
                Edit Profile
              </button>
              <label style={{ cursor: "pointer", margin: 0 }}>
                <span style={{ marginRight: 4 }}>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              <button onClick={handleLogout} style={{ padding: "4px 12px" }}>Logout</button>
            </>
          )}
          <span style={{ marginLeft: 12, fontWeight: 600 }}>Nguyễn Văn An</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;