import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import StaffProtectedRoute from "./components/StaffProtectedRoute";
import Home from "./features/home/pages/Home";

import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import StaffLogin from "./features/auth/pages/StaffLogin";
import ForgotPassword from "./features/auth/pages/ForgotPassword";

import Dashboard from "./features/parishioner/pages/Dashboard";
import Wedding from "./features/parishioner/pages/Wedding";
import Funeral from "./features/parishioner/pages/Funeral";
import Baptism from "./features/parishioner/pages/Baptism";
import Mass from "./features/parishioner/pages/Mass";
import Document from "./features/parishioner/pages/Document";
import Profile from "./features/parishioner/pages/Profile";
import Help from "./features/parishioner/pages/Help";
import AboutParish from "./features/parishioner/pages/About";

import ARTest from "./features/ar-navigation/ARTest";

import StaffDashboard from "./features/staff/pages/Dashboard";
import Announcements from "./features/staff/pages/Announcement";
import Events from "./features/staff/pages/Events";
import MassIntentions from "./features/staff/pages/MassIntentions";
import BookingManagement from "./features/staff/pages/BookingManagement";
import Requests from "./features/staff/pages/Request";
import Transactions from "./features/staff/pages/Transactions";
import StaffSettings from "./features/staff/pages/Settings";
import StaffAvailability from "./features/staff/pages/Availability";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<AboutParish />} />

          <Route path="/services/wedding" element={<Wedding />} />

          <Route path="/services/funeral" element={<Funeral />} />

          <Route path="/services/baptism" element={<Baptism />} />

          <Route path="/services/mass-intention" element={<Mass />} />

          <Route path="/services/document-request" element={<Document />} />

          <Route path="/ar-navigation" element={<ARTest />} />
        </Route>

        <Route element={<StaffProtectedRoute />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/announcements" element={<Announcements />} />
          <Route path="/staff/events" element={<Events />} />
          <Route path="/staff/mass-intentions" element={<MassIntentions />} />
          <Route path="/staff/bookings" element={<BookingManagement />} />
          <Route path="/staff/requests" element={<Requests />} />
          <Route path="/staff/transactions" element={<Transactions />} />
          <Route path="/staff/settings" element={<StaffSettings />} />
          <Route path="/staff/availability" element={<StaffAvailability />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
