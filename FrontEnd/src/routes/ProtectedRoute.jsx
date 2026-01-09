import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RoutePaths } from "./RoutePaths";
import AuthService from "../services/AuthService";

/**
 * ProtectedRoute - Component bảo vệ route
 * @param {React.ReactNode} children - Component con cần bảo vệ
 * @param {string|string[]} requiredRoles - Role yêu cầu (optional)
 * @param {boolean} adminOnly - Chỉ cho phép admin (optional)
 */
export default function ProtectedRoute({
  children,
  requiredRoles = null,
  adminOnly = false
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, role } = useSelector((state) => state.auth);
  const hasShownToast = useRef(false);

  // Kiểm tra token trong localStorage (backup check)
  const hasToken = localStorage.getItem("accessToken");
  const isAuth = isAuthenticated || (hasToken && AuthService.isAuthenticated());

  // Kiểm tra quyền admin
  const userIsAdmin = isAdmin || AuthService.isCurrentUserAdmin();
  const userRole = role || AuthService.getCurrentRole();

  // Kiểm tra quyền truy cập
  const hasAdminAccess = !adminOnly || userIsAdmin;
  const hasRoleAccess = !requiredRoles || (
    Array.isArray(requiredRoles)
      ? requiredRoles.includes(userRole)
      : requiredRoles === userRole
  );

  // Hiển thị thông báo và quay lại trang trước nếu không có quyền
  useEffect(() => {
    if (isAuth && (!hasAdminAccess || !hasRoleAccess) && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Bạn không có quyền truy cập trang này!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Quay lại trang trước đó hoặc về trang chủ
      setTimeout(() => {
        navigate(-1);
      }, 100);
    }
  }, [isAuth, hasAdminAccess, hasRoleAccess, navigate]);

  // Chưa đăng nhập
  if (!isAuth) {
    // Lưu lại đường dẫn hiện tại để redirect sau khi đăng nhập
    return <Navigate to={RoutePaths.LOGIN} state={{ from: location }} replace />;
  }

  // Không có quyền - render null trong khi đợi redirect
  if (!hasAdminAccess || !hasRoleAccess) {
    return null;
  }

  return children;
}

/**
 * AdminRoute - Component bảo vệ route chỉ dành cho admin
 */
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute adminOnly={true}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * RoleRoute - Component bảo vệ route theo role cụ thể
 */
export function RoleRoute({ children, roles }) {
  return (
    <ProtectedRoute requiredRoles={roles}>
      {children}
    </ProtectedRoute>
  );
}
