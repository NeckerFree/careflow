import { Routes, Route } from "react-router";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import NotFoundPage from "./pages/NotFoundPage";
import RequireAuth from "./components/RequireAuth";
import { AccessDeniedPage } from "./pages/AccessDeniedPage";
import RequirePermission from "./components/RequirePermission";
function App()
{
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/app" element={<AppLayout />} >
          <Route index element={<DashboardPage />} />
          <Route element={<RequirePermission permission="patients:read" />}>
            <Route path="patients" element={<PatientsPage />} />
          </Route>
          <Route element={<RequirePermission permission="appointments:read" />}>
            <Route path="appointments" element={<AppointmentsPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
