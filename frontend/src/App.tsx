import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./features/home/pages/Home";
import SignUp from "./features/auth/pages/SignUp";
import Login from "./features/auth/pages/Login";
import StaffLogin from "./features/auth/pages/StaffLogin";
import Dashboard from "./features/dashboard/pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
