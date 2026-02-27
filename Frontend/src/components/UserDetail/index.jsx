import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Skeleton,
  Avatar,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkIcon from "@mui/icons-material/Work";
import InfoIcon from "@mui/icons-material/Info";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/user/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("User not found.");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError("User not found.");
      }
    };
    
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:8081/api/user/${userId}/stats`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats");
      }
    };
    
    fetchUser();
    fetchStats();
  }, [userId]);

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error}
      </Typography>
    );
  }

  if (!user) {
    return (
      <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3 }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ mx: "auto", mb: 2 }} />
        <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="40%" sx={{ mx: "auto" }} />
        <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
      <CardContent sx={{ textAlign: "center", py: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            bgcolor: "primary.main",
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          {user.first_name?.[0]}{user.last_name?.[0]}
        </Avatar>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>

        {/* Stats */}
        {stats && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 2 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700}>{stats.photoCount}</Typography>
              <Typography variant="caption" color="text.secondary">Photos</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <FavoriteIcon fontSize="small" color="error" />
                {stats.totalLikes}
              </Typography>
              <Typography variant="caption" color="text.secondary">Likes</Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                <ChatBubbleIcon fontSize="small" color="primary" />
                {stats.totalComments}
              </Typography>
              <Typography variant="caption" color="text.secondary">Comments</Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ textAlign: "left", px: 2 }}>
          {user.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <LocationOnIcon color="action" fontSize="small" />
              <Typography variant="body1">{user.location}</Typography>
            </Box>
          )}
          {user.occupation && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <WorkIcon color="action" fontSize="small" />
              <Typography variant="body1">{user.occupation}</Typography>
            </Box>
          )}
          {user.description && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
              <InfoIcon color="action" fontSize="small" sx={{ mt: 0.3 }} />
              <Typography variant="body1" color="text.secondary">
                {user.description}
              </Typography>
            </Box>
          )}
        </Box>

        <Button
          component={Link}
          to={`/photos/${userId}`}
          variant="contained"
          startIcon={<PhotoLibraryIcon />}
          sx={{ mt: 3, textTransform: "none", px: 4 }}
        >
          View Photos
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
