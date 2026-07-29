import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./features/home/pages/Home";
import SignUp from "./features/auth/pages/SignUp";
import Login from "./features/auth/pages/Login";
import StaffLogin from "./features/auth/pages/StaffLogin";
import Dashboard from "./features/parishioner/pages/Dashboard";
import Wedding from "./features/parishioner/pages/Wedding";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
