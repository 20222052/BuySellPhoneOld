import { Navigate } from "react-router-dom";
import { RoutePaths } from "./RoutePaths";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    return <Navigate to={RoutePaths.LOGIN} replace />;
  }

  return children;
}
