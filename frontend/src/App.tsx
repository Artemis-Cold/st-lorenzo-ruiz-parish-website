import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Home from "./features/home/pages/Home";

import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import StaffLogin from "./features/auth/pages/StaffLogin";

import Dashboard from "./features/parishioner/pages/Dashboard";
import Wedding from "./features/parishioner/pages/Wedding";
import Funeral from "./features/parishioner/pages/Funeral";
import Baptism from "./features/parishioner/pages/Baptism";
import Mass from "./features/parishioner/pages/Mass";
import Document from "./features/parishioner/pages/Document";
import Profile from "./features/parishioner/pages/Profile";

import ARTest from "./features/ar-navigation/ARTest";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
        </Route>

        <Route path="/staff/login" element={<StaffLogin />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/services/wedding" element={<Wedding />} />

          <Route path="/services/funeral" element={<Funeral />} />

          <Route path="/services/baptism" element={<Baptism />} />

          <Route path="/services/mass-intention" element={<Mass />} />

          <Route path="/services/document-request" element={<Document />} />

          <Route path="/ar-navigation" element={<ARTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
