import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoutePaths } from "./RoutePaths";
import ProtectedRoute, { AdminRoute } from "./ProtectedRoute";

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
import FormElements from "@/pages/Admin/FormElements";
import CategoryList from "@/pages/Admin/Categories/CategoryList";
import BrandList from "@/pages/Admin/Brands/BrandList";
import UserList from "@/pages/Admin/Users/UserList";
import ProductItemList from "@/pages/Admin/Products/ProductItemList";
import ProductList from "@/pages/Admin/Products/ProductList";
import BlogList from "@/pages/Admin/Blogs/BlogList";

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
          <Route path={RoutePaths.ABOUT} element={<About />} />

          {/* Protected User Routes */}
          <Route path={RoutePaths.CART} element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path={RoutePaths.CHECKOUT} element={
            <ProtectedRoute>
              <CheckOut />
            </ProtectedRoute>
          } />
          <Route path={RoutePaths.PROFILE} element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path={RoutePaths.ORDERS} element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path={RoutePaths.WISHLIST} element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path={RoutePaths.SETTINGS} element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>

        {/* Auth Routes without Layout */}
        <Route path={RoutePaths.LOGIN} element={<Login />} />
        <Route path={RoutePaths.REGISTER} element={<Register />} />
        <Route path={RoutePaths.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={RoutePaths.OTP_REGISTER} element={<OTPRegister />} />
        <Route path={RoutePaths.OTP_FORGOT} element={<OTPForgot />} />
        <Route path={RoutePaths.RESET_PASSWORD} element={<ResetPassword />} />

        {/* Protected Admin Routes - Only for admin role */}
        <Route
          path={RoutePaths.ADMIN}
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to={RoutePaths.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="form-elements" element={<FormElements />} />
          <Route path="categories" element={<CategoryList />} />
          <Route path="brands" element={<BrandList />} />
          <Route path="users" element={<UserList />} />
          <Route path="products" element={<ProductList />} />
          <Route path="variants" element={<ProductItemList />} />
          <Route path="blogs" element={<BlogList />} />
          <Route path="orders" element={<div>Admin Orders</div>} />
        </Route>

        {/* 404 Not Found */}
        <Route path={RoutePaths.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
