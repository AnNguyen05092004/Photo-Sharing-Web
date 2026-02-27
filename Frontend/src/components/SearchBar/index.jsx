import React, { useState } from "react";
import {
  IconButton,
  InputBase,
  Paper,
  Popper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  ClickAwayListener,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PhotoIcon from "@mui/icons-material/Photo";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], photos: [] });
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ users: [], photos: [] });
      setAnchorEl(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8081/api/search?q=${encodeURIComponent(searchQuery)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setResults({ users: data.users || [], photos: data.photos || [] });
      }
    } catch (err) {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setAnchorEl(e.currentTarget);

    // Debounce search
    const timer = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timer);
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
    setQuery("");
    setAnchorEl(null);
  };

  const handlePhotoClick = (photo) => {
    navigate(`/photos/${photo.user?._id}`);
    setQuery("");
    setAnchorEl(null);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl) && (results.users.length > 0 || results.photos.length > 0 || loading);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            width: 280,
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          <SearchIcon sx={{ color: "white", mr: 1 }} />
          <InputBase
            placeholder="Search users, photos..."
            value={query}
            onChange={handleInputChange}
            onFocus={(e) => {
              if (query.trim()) setAnchorEl(e.currentTarget);
            }}
            sx={{
              color: "white",
              flex: 1,
              "& ::placeholder": { color: "rgba(255,255,255,0.7)", opacity: 1 },
            }}
          />
        </Paper>

        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ zIndex: 1300 }}
        >
          <Paper sx={{ width: 320, maxHeight: 400, overflow: "auto", mt: 1 }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                {results.users.length > 0 && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 2, py: 1, bgcolor: "grey.100", fontWeight: 600 }}
                    >
                      Users
                    </Typography>
                    <List dense>
                      {results.users.map((user) => (
                        <ListItem
                          key={user._id}
                          button
                          onClick={() => handleUserClick(user._id)}
                          sx={{ "&:hover": { bgcolor: "action.hover" } }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${user.first_name} ${user.last_name}`}
                            secondary={user.occupation || user.location}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {results.photos.length > 0 && (
                  <>
                    {results.users.length > 0 && <Divider />}
                    <Typography
                      variant="subtitle2"
                      sx={{ px: 2, py: 1, bgcolor: "grey.100", fontWeight: 600 }}
                    >
                      Photos
                    </Typography>
                    <List dense>
                      {results.photos.map((photo) => (
                        <ListItem
                          key={photo._id}
                          button
                          onClick={() => handlePhotoClick(photo)}
                          sx={{ "&:hover": { bgcolor: "action.hover" } }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              variant="rounded"
                              src={`http://localhost:8081/images/${photo.file_name}`}
                              sx={{ bgcolor: "grey.300" }}
                            >
                              <PhotoIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={photo.caption || "Photo"}
                            secondary={
                              photo.user
                                ? `by ${photo.user.first_name} ${photo.user.last_name}`
                                : ""
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {results.users.length === 0 && results.photos.length === 0 && (
                  <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
                    No results found
                  </Typography>
                )}
              </>
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}

export default SearchBar;
