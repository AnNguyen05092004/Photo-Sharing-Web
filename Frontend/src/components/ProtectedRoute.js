// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ isLoggedIn, children }) {
  const location = useLocation();

  if (isLoggedIn === null) return null; // Đang kiểm tra login
  if (!isLoggedIn)
    return <Navigate to="/login" state={{ from: location }} />;

  return children;
}
