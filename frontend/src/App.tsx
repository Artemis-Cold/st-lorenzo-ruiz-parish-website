import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./features/home/pages/Home";
import SignUp from "./features/auth/pages/SignUp";
import Login from "./features/auth/pages/Login";
import StaffLogin from "./features/auth/pages/StaffLogin";
import Dashboard from "./features/parishioner/pages/Dashboard";
import Wedding from "./features/parishioner/pages/Wedding";
import Funeral from "./features/parishioner/pages/Funeral";
import Baptism from "./features/parishioner/pages/Baptism";
import Mass from "./features/parishioner/pages/Mass";
import Document from "./features/parishioner/pages/Document";
import ARTest from "./features/ar-navigation/ARTest";
import Profile from "./features/parishioner/pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services/wedding" element={<Wedding />} />
        <Route path="/services/funeral" element={<Funeral />} />
        <Route path="/services/baptism" element={<Baptism />} />
        <Route path="/services/mass-intention" element={<Mass />} />
        <Route path="/services/document-request" element={<Document />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ar-navigation" element={<ARTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
