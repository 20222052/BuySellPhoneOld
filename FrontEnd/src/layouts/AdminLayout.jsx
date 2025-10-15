import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="container-fluid">
      {/* Sidebar, Topbar */}
      <Outlet />
    </div>
  );
}
