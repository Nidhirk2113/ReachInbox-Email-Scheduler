import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Scheduled from "./pages/Scheduled";
import Sent from "./pages/Sent";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Account from "./pages/Account";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            element={<AppLayout />}
          >
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/campaigns"
              element={<Campaigns />}
            />

            <Route
              path="/scheduled"
              element={<Scheduled />}
            />

            <Route
              path="/sent"
              element={<Sent />}
            />

            <Route
              path="/activity"
              element={<Activity />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />

            <Route
              path="/account"
              element={<Account />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}