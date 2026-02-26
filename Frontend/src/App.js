
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import EditProfile from "./components/EditProfile";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#e91e63" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: { borderRadius: 12 },
});

function ProtectedRoute({ element, isLoggedIn }) {
  const location = useLocation();
  if (isLoggedIn === null) return null;
  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location }} />;
  return element;
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const location = useLocation();
  const [reloadPhotos, setReloadPhotos] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("http://localhost:8081/api/session", {
          credentials: "include",
        });

        if (res.status === 200) {
          const user = await res.json();
          setIsLoggedIn(true);
          setLoggedInUser(user);
        } else {
          setIsLoggedIn(false);
          setLoggedInUser(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setLoggedInUser(null);
      }
    };

    checkSession();
  }, [location]);

  if (isLoggedIn === null) return null;

  return (
    <>
      <TopBar
        loggedInUser={loggedInUser}
        setLoggedInUser={setLoggedInUser}
        setIsLoggedIn={setIsLoggedIn}
        onPhotoUploaded={() => setReloadPhotos((v) => !v)}
      />
      <div style={{ display: "flex", marginTop: 72, minHeight: "calc(100vh - 72px)" }}>
        {isLoggedIn && (
          <div style={{ width: 280, flexShrink: 0 }}>
            <UserList />
          </div>
        )}
        <div style={{ flex: 1, padding: "24px 32px", maxWidth: 960 }}>
          <Routes>
            <Route path="/login" element={<LoginRegister setIsLoggedIn={setIsLoggedIn} />} />
            <Route
              path="/users/:userId"
              element={
                <ProtectedRoute
                  element={<UserDetail />}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
            <Route
              path="/users/:userId/edit"
              element={
                <ProtectedRoute
                  element={<EditProfile loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
            <Route
              path="/photos/:userId"
              element={
                <ProtectedRoute
                  element={<UserPhotos reload={reloadPhotos} loggedInUser={loggedInUser} />}
                  isLoggedIn={isLoggedIn}
                />
              }
            />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default function AppWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  );
}