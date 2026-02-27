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
  Collapse,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import ReplyIcon from "@mui/icons-material/Reply";

function UserPhotos({ reload, loggedInUser }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, photoId: null, commentId: null, replyId: null });
  const [editCaptionDialog, setEditCaptionDialog] = useState({ open: false, photoId: null, caption: "" });

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
    setDeleteDialog({ open: false, type: null, photoId: null, commentId: null, replyId: null });
  };

  // Add reply to comment
  const handleAddReply = async (photoId, commentId) => {
    const key = `${photoId}-${commentId}`;
    const reply = replyInputs[key]?.trim();
    if (!reply) return;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: reply }),
      });
      if (res.ok) {
        setReplyInputs((prev) => ({ ...prev, [key]: "" }));
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Failed to reply", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Failed to reply", severity: "error" });
    }
  };

  // Delete reply
  const handleDeleteReply = async () => {
    const { photoId, commentId, replyId } = deleteDialog;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}/comments/${commentId}/replies/${replyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Reply deleted!", severity: "success" });
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Delete failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    }
    setDeleteDialog({ open: false, type: null, photoId: null, commentId: null, replyId: null });
  };

  // Update caption
  const handleUpdateCaption = async () => {
    const { photoId, caption } = editCaptionDialog;
    try {
      const res = await fetch(`http://localhost:8081/api/photo/${photoId}/caption`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caption }),
      });
      if (res.ok) {
        setSnackbar({ open: true, message: "Caption updated!", severity: "success" });
        fetchPhotos(page);
      } else {
        const err = await res.json();
        setSnackbar({ open: true, message: err.message || "Update failed", severity: "error" });
      }
    } catch {
      setSnackbar({ open: true, message: "Update failed", severity: "error" });
    }
    setEditCaptionDialog({ open: false, photoId: null, caption: "" });
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
                  <>
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() =>
                        setEditCaptionDialog({ open: true, photoId: photo._id, caption: photo.caption || "" })
                      }
                      title="Edit caption"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() =>
                        setDeleteDialog({ open: true, type: "photo", photoId: photo._id, commentId: null, replyId: null })
                      }
                      title="Delete photo"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </CardActions>

              <CardContent sx={{ pt: 1 }}>
                {/* Caption */}
                {photo.caption && (
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    {photo.caption}
                  </Typography>
                )}
                
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
                      const replyKey = `${photo._id}-${comment._id}`;
                      const hasReplies = comment.replies && comment.replies.length > 0;
                      
                      return (
                        <Box key={comment._id} sx={{ mb: 1.5 }}>
                          <Box
                            sx={{
                              display: "flex",
                              gap: 1.5,
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
                                <IconButton
                                  size="small"
                                  onClick={() => setShowReplies((prev) => ({ ...prev, [replyKey]: !prev[replyKey] }))}
                                  sx={{ p: 0.3 }}
                                  title="Reply"
                                >
                                  <ReplyIcon fontSize="inherit" />
                                </IconButton>
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
                                        replyId: null,
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
                              
                              {/* Replies */}
                              {hasReplies && (
                                <Box sx={{ ml: 2, mt: 1, borderLeft: 2, borderColor: "divider", pl: 1.5 }}>
                                  {comment.replies.map((reply) => {
                                    const isReplyOwner = reply.user?._id?.toString() === currentUserId?.toString();
                                    return (
                                      <Box key={reply._id} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "flex-start" }}>
                                        <Avatar sx={{ width: 22, height: 22, fontSize: 10, bgcolor: "grey.400" }}>
                                          {reply.user?.first_name?.[0] || "?"}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            <Typography
                                              variant="caption"
                                              component={Link}
                                              to={reply.user ? `/users/${reply.user._id}` : "#"}
                                              sx={{ fontWeight: 600, color: "primary.main", textDecoration: "none" }}
                                            >
                                              {reply.user ? `${reply.user.first_name} ${reply.user.last_name}` : "Unknown"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {formatDate(reply.date_time)}
                                            </Typography>
                                            {isReplyOwner && (
                                              <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                  setDeleteDialog({
                                                    open: true,
                                                    type: "reply",
                                                    photoId: photo._id,
                                                    commentId: comment._id,
                                                    replyId: reply._id,
                                                  })
                                                }
                                                sx={{ p: 0.2, ml: "auto" }}
                                              >
                                                <DeleteIcon sx={{ fontSize: 12 }} />
                                              </IconButton>
                                            )}
                                          </Box>
                                          <Typography variant="caption">{reply.comment}</Typography>
                                        </Box>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              )}
                              
                              {/* Reply input */}
                              <Collapse in={showReplies[replyKey]}>
                                <Box sx={{ display: "flex", gap: 1, mt: 1, ml: 2 }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Write a reply..."
                                    value={replyInputs[replyKey] || ""}
                                    onChange={(e) =>
                                      setReplyInputs((prev) => ({ ...prev, [replyKey]: e.target.value }))
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddReply(photo._id, comment._id);
                                      }
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                  />
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleAddReply(photo._id, comment._id)}
                                    disabled={!replyInputs[replyKey]?.trim()}
                                  >
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Collapse>
                            </Box>
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
        onClose={() => setDeleteDialog({ open: false, type: null, photoId: null, commentId: null, replyId: null })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialog.type === "photo"
              ? "Are you sure you want to delete this photo? This action cannot be undone."
              : deleteDialog.type === "reply"
              ? "Are you sure you want to delete this reply?"
              : "Are you sure you want to delete this comment?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: null, photoId: null, commentId: null, replyId: null })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={
              deleteDialog.type === "photo"
                ? handleDeletePhoto
                : deleteDialog.type === "reply"
                ? handleDeleteReply
                : handleDeleteComment
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Caption Dialog */}
      <Dialog
        open={editCaptionDialog.open}
        onClose={() => setEditCaptionDialog({ open: false, photoId: null, caption: "" })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Caption</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a caption..."
            value={editCaptionDialog.caption}
            onChange={(e) => setEditCaptionDialog((prev) => ({ ...prev, caption: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditCaptionDialog({ open: false, photoId: null, caption: "" })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateCaption}>
            Save
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