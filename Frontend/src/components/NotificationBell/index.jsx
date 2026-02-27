import React, { useState, useEffect, useCallback } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ReplyIcon from "@mui/icons-material/Reply";
import { useNavigate } from "react-router-dom";

function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8081/api/notifications?limit=10", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await fetch(`http://localhost:8081/api/notifications/${notification._id}/read`, {
        method: "PUT",
        credentials: "include",
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
    }
    // Navigate to photo
    if (notification.photo_id) {
      navigate(`/photos/${notification.photo_id.user_id || notification.from_user_id._id}`);
    }
    handleClose();
  };

  const handleMarkAllRead = async () => {
    await fetch("http://localhost:8081/api/notifications/read-all", {
      method: "PUT",
      credentials: "include",
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case "like":
        return <FavoriteIcon fontSize="small" color="error" />;
      case "comment":
        return <ChatBubbleIcon fontSize="small" color="primary" />;
      case "reply":
        return <ReplyIcon fontSize="small" color="secondary" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getMessage = (notification) => {
    const name = notification.from_user_id
      ? `${notification.from_user_id.first_name} ${notification.from_user_id.last_name}`
      : "Someone";
    switch (notification.type) {
      case "like":
        return `${name} liked your photo`;
      case "comment":
        return `${name} commented on your photo`;
      case "reply":
        return `${name} replied to your comment`;
      default:
        return "New notification";
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 360, maxHeight: 400 },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight={600}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {loading && notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Typography sx={{ p: 3, textAlign: "center" }} color="text.secondary">
            No notifications yet
          </Typography>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 1.5,
                bgcolor: notification.read ? "transparent" : "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: "grey.200" }}>
                  {getIcon(notification.type)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                    {getMessage(notification)}
                  </Typography>
                  {notification.content && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      "{notification.content}"
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notification.date_time)}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}

export default NotificationBell;
