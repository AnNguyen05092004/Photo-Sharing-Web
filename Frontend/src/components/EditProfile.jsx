import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Box,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function EditProfile({ loggedInUser, setLoggedInUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8081/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) =>
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          location: data.location || "",
          description: data.description || "",
          occupation: data.occupation || "",
        })
      );
  }, [userId]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess(false);
    const res = await fetch(`http://localhost:8081/api/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setMessage("Profile updated successfully!");
      setSuccess(true);
      setLoggedInUser((u) => ({ ...u, ...form }));
      setTimeout(() => navigate(`/users/${userId}`), 1200);
    } else {
      setMessage("Update failed!");
      setSuccess(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
      <Card sx={{ width: 480, p: 1 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Edit Profile
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  name="first_name"
                  label="First name"
                  value={form.first_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  name="last_name"
                  label="Last name"
                  value={form.last_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Box>
              <TextField
                name="location"
                label="Location"
                value={form.location}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="occupation"
                label="Occupation"
                value={form.occupation}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />

              {message && (
                <Alert severity={success ? "success" : "error"}>{message}</Alert>
              )}

              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(`/users/${userId}`)}
                  sx={{ textTransform: "none", flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{ textTransform: "none", flex: 1 }}
                >
                  Save
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default EditProfile;