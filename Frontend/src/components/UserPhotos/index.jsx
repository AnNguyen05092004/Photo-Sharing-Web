import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  TextField,
  Box,
  Chip,
  Avatar,
  Divider,
  Pagination,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

function UserPhotos({ reload, loggedInUser }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, photoId: null, commentId: null });

  const fetchPhotos = useCallback(async (pageNum) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8081/api/photo/${userId}?page=${pageNum}&limit=5`,
        { credentials: "include" }
      );
      const data = await res.json();
      setPhotos(data.photos || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError("Cannot load photos.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setPage(1);
    fetchPhotos(1);
  }, [userId, reload, fetchPhotos]);

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchPhotos(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Like/Unlike
  const handleLike = async (photoId) => {
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPhotos((prev) =>
          prev.map((p) =>
            p._id === photoId
              ? { ...p, likes: data.likes, likeCount: data.likeCount }
              : p
          )
        );
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to like photo", severity: "error" });
    }
  };

  // Add comment
  const handleAddComment = async (photoId) => {
    const comment = commentInputs[photoId]?.trim();
    if (!comment) return;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment }),
      });
      if (res.ok) {
        setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Failed to add comment", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to add comment", severity: "error" });
    }
  };

  // Delete photo
  const handleDeletePhoto = async () => {
    const { photoId } = deleteDialog;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Photo deleted!", severity: "success" });
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Delete failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setDeleteDialog({ open: false, type: null, photoId: null, commentId: null });
  };

  // Delete comment
  const handleDeleteComment = async () => {
    const { photoId, commentId } = deleteDialog;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Comment deleted!", severity: "success" });
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Delete failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setDeleteDialog({ open: false, type: null, photoId: null, commentId: null });
  };

  const currentUserId = loggedInUser?._id;

  if (loading && photos.length === 0) {
    return (
      <Box sx={{ maxWidth: 680, mx: "auto" }}>
        {[1, 2].map((i) => (
          <Card key={i} sx={{ mb: 3 }}>
            <Skeleton variant="rectangular" height={300} />
            <CardContent>
              <Skeleton width="40%" />
              <Skeleton width="60%" />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 680, mx: "auto" }}>
      {photos.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
          No photos yet.
        </Typography>
      ) : (
        photos.map((photo) => {
          const isLiked = photo.likes?.some(
            (id) => id.toString() === currentUserId?.toString()
          );
          const isPhotoOwner = photo.user_id?.toString() === currentUserId?.toString();

          return (
            <Card key={photo._id} sx={{ mb: 3, overflow: "hidden" }}>
              {/* Photo image */}
              <CardMedia
                component="img"
                image={`http://localhost:8081/images/${photo.file_name}`}
                alt="Photo"
                sx={{ maxHeight: 500, objectFit: "contain", bgcolor: "#000" }}
              />

              {/* Actions bar - Like, Delete */}
              <CardActions sx={{ px: 2, pt: 1, pb: 0 }}>
                <IconButton onClick={() => handleLike(photo._id)} color={isLiked ? "error" : "default"}>
                  {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" sx={{ mr: 2, fontWeight: 600 }}>
                  {photo.likeCount || 0} {photo.likeCount === 1 ? "like" : "likes"}
                </Typography>

                <Chip
                  icon={<ChatBubbleOutlineIcon fontSize="small" />}
                  label={photo.comments?.length || 0}
                  size="small"
                  variant="outlined"
                />

                <Box sx={{ flex: 1 }} />

                {isPhotoOwner && (
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                      setDeleteDialog({ open: true, type: "photo", photoId: photo._id, commentId: null })
                    }
                    title="Delete photo"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </CardActions>

              <CardContent sx={{ pt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(photo.date_time)}
                </Typography>

                {/* Comments */}
                {photo.comments && photo.comments.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Divider sx={{ mb: 1 }} />
                    {photo.comments.map((comment) => {
                      const isCommentOwner =
                        comment.user?._id?.toString() === currentUserId?.toString();
                      return (
                        <Box
                          key={comment._id}
                          sx={{
                            display: "flex",
                            gap: 1.5,
                            mb: 1.5,
                            alignItems: "flex-start",
                          }}
                        >
                          <Avatar
                            sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "secondary.main", mt: 0.3 }}
                          >
                            {comment.user?.first_name?.[0] || "?"}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                variant="body2"
                                component={Link}
                                to={comment.user ? `/users/${comment.user._id}` : "#"}
                                sx={{
                                  fontWeight: 600,
                                  color: "primary.main",
                                  textDecoration: "none",
                                  "&:hover": { textDecoration: "underline" },
                                }}
                              >
                                {comment.user
                                  ? `${comment.user.first_name} ${comment.user.last_name}`
                                  : "Unknown"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(comment.date_time)}
                              </Typography>
                              {isCommentOwner && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      type: "comment",
                                      photoId: photo._id,
                                      commentId: comment._id,
                                    })
                                  }
                                  sx={{ ml: "auto", p: 0.3 }}
                                >
                                  <DeleteIcon fontSize="inherit" />
                                </IconButton>
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                              {comment.comment}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {/* Add comment */}
                <Box sx={{ display: "flex", gap: 1, mt: 1.5, alignItems: "center" }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Add a comment..."
                    value={commentInputs[photo._id] || ""}
                    onChange={(e) =>
                      setCommentInputs((prev) => ({
                        ...prev,
                        [photo._id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(photo._id);
                      }
                    }}
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleAddComment(photo._id)}
                    disabled={!commentInputs[photo._id]?.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, type: null, photoId: null, commentId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.type === "photo"
              ? "Are you sure you want to delete this photo? This action cannot be undone."
              : "Are you sure you want to delete this comment?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: null, photoId: null, commentId: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={deleteDialog.type === "photo" ? handleDeletePhoto : handleDeleteComment}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
    </Box>
  );
}

export default UserPhotos;