import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Skeleton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userId: activeUserId } = useParams();

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
        console.error("Error loading users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "calc(100vh - 72px)",
        overflow: "auto",
        borderRight: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ px: 2, py: 2, fontWeight: 600, color: "primary.main" }}>
        Users
      </Typography>

      {loading ? (
        <List>
          {[...Array(6)].map((_, i) => (
            <ListItemButton key={i}>
              <ListItemAvatar>
                <Skeleton variant="circular" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText primary={<Skeleton width="70%" />} />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <List disablePadding>
          {users.map((user) => (
            <ListItemButton
              key={user._id}
              component={Link}
              to={`/users/${user._id}`}
              selected={user._id === activeUserId}
              sx={{
                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  "&:hover": { bgcolor: "primary.light" },
                  "& .MuiAvatar-root": { bgcolor: "primary.dark" },
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36, fontSize: 16 }}>
                  {user.first_name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${user.first_name} ${user.last_name}`}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default UserList;
