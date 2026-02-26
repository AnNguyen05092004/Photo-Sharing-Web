import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

function LoginRegister({ setIsLoggedIn }) {
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [signup, setSignup] = useState(false);

  const [reg, setReg] = useState({
    login_name: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await fetch("http://localhost:8081/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ login_name: loginName, password }),
      });
      if (res.status === 200) {
        const data = await res.json();
        setIsLoggedIn(true);
        navigate(`/users/${data._id}`);
      } else {
        const err = await res.json();
        setError(err.message || "Login failed");
      }
    } catch {
      setError("Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (reg.password !== reg.password2) {
      setRegError("Passwords do not match.");
      return;
    }
    if (!reg.login_name || !reg.password || !reg.first_name || !reg.last_name) {
      setRegError("Please fill all required fields.");
      return;
    }
    const res = await fetch("http://localhost:8081/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login_name: reg.login_name,
        password: reg.password,
        first_name: reg.first_name,
        last_name: reg.last_name,
        location: reg.location,
        description: reg.description,
        occupation: reg.occupation,
      }),
    });
    if (res.ok) {
      setRegSuccess("Registration successful! You can now log in.");
      setReg({
        login_name: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        location: "",
        description: "",
        occupation: "",
      });
    } else {
      const msg = await res.text();
      setRegError(msg);
    }
  };

  if (signup) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <Card sx={{ width: 420, p: 1 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
              Join PhotoShare today
            </Typography>

            <form onSubmit={handleRegister}>
              <Stack spacing={2}>
                <TextField
                  label="Login name"
                  required
                  fullWidth
                  size="small"
                  value={reg.login_name}
                  onChange={(e) => setReg((r) => ({ ...r, login_name: e.target.value }))}
                />
                <TextField
                  type="password"
                  label="Password"
                  required
                  fullWidth
                  size="small"
                  value={reg.password}
                  onChange={(e) => setReg((r) => ({ ...r, password: e.target.value }))}
                />
                <TextField
                  type="password"
                  label="Repeat Password"
                  required
                  fullWidth
                  size="small"
                  value={reg.password2}
                  onChange={(e) => setReg((r) => ({ ...r, password2: e.target.value }))}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="First name"
                    required
                    fullWidth
                    size="small"
                    value={reg.first_name}
                    onChange={(e) => setReg((r) => ({ ...r, first_name: e.target.value }))}
                  />
                  <TextField
                    label="Last name"
                    required
                    fullWidth
                    size="small"
                    value={reg.last_name}
                    onChange={(e) => setReg((r) => ({ ...r, last_name: e.target.value }))}
                  />
                </Box>
                <TextField
                  label="Location"
                  fullWidth
                  size="small"
                  value={reg.location}
                  onChange={(e) => setReg((r) => ({ ...r, location: e.target.value }))}
                />
                <TextField
                  label="Occupation"
                  fullWidth
                  size="small"
                  value={reg.occupation}
                  onChange={(e) => setReg((r) => ({ ...r, occupation: e.target.value }))}
                />
                <TextField
                  label="Description"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={reg.description}
                  onChange={(e) => setReg((r) => ({ ...r, description: e.target.value }))}
                />

                {regError && <Alert severity="error">{regError}</Alert>}
                {regSuccess && <Alert severity="success">{regSuccess}</Alert>}

                <Button type="submit" variant="contained" fullWidth startIcon={<PersonAddIcon />} sx={{ textTransform: "none" }}>
                  Register
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 2 }} />

            <Button fullWidth onClick={() => setSignup(false)} sx={{ textTransform: "none" }}>
              Already have an account? Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
      <Card sx={{ width: 400, p: 1 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Login to PhotoShare
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Login name"
              fullWidth
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              autoComplete="username"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <TextField
              type="password"
              label="Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button variant="contained" fullWidth startIcon={<LoginIcon />} onClick={handleLogin} sx={{ textTransform: "none", py: 1.2 }}>
              Login
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Button size="small" onClick={() => setSignup(true)} sx={{ textTransform: "none" }}>
              Sign up
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginRegister;