import { Routes, Route } from "react-router-dom";
import PublicLayout from "@layouts/PublicLayout";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@pages/Home/Home";
import Login from "@pages/Auth/Login";
import Dashboard from "@pages/Admin/Dashboard";
import NotFound from "@pages/NotFound/NotFound";

export default function AppRouter() {
  const isAuthed = !!localStorage.getItem("accessToken");

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute isAuthed={isAuthed} />}>
        <Route path="/admin" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
