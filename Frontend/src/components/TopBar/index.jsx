import React, { useRef, useEffect, useState } from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";

function TopBar({ loggedInUser, setLoggedInUser, setIsLoggedIn, onPhotoUploaded }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [pageUser, setPageUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

  let centerContent = "PhotoShare";
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
      setSnackbar({ open: true, message: "Photo uploaded successfully!", severity: "success" });
    } else {
      setSnackbar({ open: true, message: "Upload failed!", severity: "error" });
    }
    e.target.value = "";
  };

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          {/* Left */}
          <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 180 }}>
            {loggedInUser ? `Hi, ${loggedInUser.first_name}` : "Please Login"}
          </Typography>

          {/* Center */}
          <Typography variant="h6" sx={{ fontWeight: 500, textAlign: "center", flex: 1 }}>
            {centerContent}
          </Typography>

          {/* Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {loggedInUser && (
              <>
                <IconButton
                  color="inherit"
                  onClick={() => navigate(`/users/${loggedInUser._id}/edit`)}
                  title="Edit Profile"
                >
                  <EditIcon />
                </IconButton>

                <IconButton color="inherit" component="label" title="Upload Photo">
                  <PhotoCameraIcon />
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </IconButton>

                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ textTransform: "none" }}
                >
                  Logout
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default TopBar;