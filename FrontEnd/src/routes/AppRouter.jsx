import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoutePaths } from "./RoutePaths";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Public Pages
import Home from "@/pages/Home/Home";
import Trade_inPage from "@/pages/Home/Trade_inPage";
import Blogs from "@/pages/Home/Blogs";
import BlogDetail from "@/pages/Home/BlogDetail";
import Products from "@/pages/Home/Products";
import ProductDetail from "@/pages/Home/ProductDetail";
import Cart from "@/pages/Home/Cart";
import CheckOut from "@/pages/Home/CheckOut";
import About from "@/pages/Home/About";
import Profile from "@/pages/Home/Profile";
import Orders from "@/pages/Home/Orders";
import Wishlist from "@/pages/Home/Wishlist";
import Settings from "@/pages/Home/Settings";
import NotFound from "@/pages/NotFound/NotFound";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/FogotPassWord";
import OTPRegister from "@/pages/Auth/OTPRegister";
import OTPForgot from "@/pages/Auth/OTPFogot";
import ResetPassword from "@/pages/Auth/ResetPassword";

// Admin Pages
import Dashboard from "@/pages/Admin/Dashboard";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<PublicLayout />}>
          <Route path={RoutePaths.HOME} element={<Home />} />
          <Route path={RoutePaths.PRODUCTS} element={<Products />} />
          <Route path={RoutePaths.PRODUCT_DETAIL} element={<ProductDetail />} />
          <Route path={RoutePaths.BLOG} element={<Blogs />} />
          <Route path={RoutePaths.BLOG_DETAIL} element={<BlogDetail />} />
          <Route path={RoutePaths.TRADEIN} element={<Trade_inPage />} />
          <Route path={RoutePaths.CART} element={<Cart />} />
          <Route path={RoutePaths.CHECKOUT} element={<CheckOut />} />
          <Route path={RoutePaths.ABOUT} element={<About />} />
          <Route path={RoutePaths.PROFILE} element={<Profile />} />
          <Route path={RoutePaths.ORDERS} element={<Orders />} />
          <Route path={RoutePaths.WISHLIST} element={<Wishlist />} />
          <Route path={RoutePaths.SETTINGS} element={<Settings />} />
        </Route>

        {/* Auth Routes without Layout */}
        <Route path={RoutePaths.LOGIN} element={<Login />} />
        <Route path={RoutePaths.REGISTER} element={<Register />} />
        <Route path={RoutePaths.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={RoutePaths.OTP_REGISTER} element={<OTPRegister />} />
        <Route path={RoutePaths.OTP_FORGOT} element={<OTPForgot />} />
        <Route path={RoutePaths.RESET_PASSWORD} element={<ResetPassword />} />

        {/* Protected Admin Routes */}
        <Route
          path={RoutePaths.ADMIN}
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={RoutePaths.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<div>Admin Products</div>} />
          <Route path="orders" element={<div>Admin Orders</div>} />
          <Route path="users" element={<div>Admin Users</div>} />
        </Route>

        {/* 404 Not Found */}
        <Route path={RoutePaths.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
