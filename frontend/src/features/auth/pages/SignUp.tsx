import { Link } from "react-router-dom";
import { User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import PasswordField from "../components/PasswordField";
import PhoneField from "../components/PhoneField";
import TextField from "../components/TextField";

export default function SignUp() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Register to access parish services online."
    >
      <form className="space-y-5">
        <TextField
          label="First Name"
          placeholder="Enter First Name"
          icon={User}
        />

        <TextField
          label="Last Name"
          placeholder="Enter Last Name"
          icon={User}
        />

        <PhoneField />

        <TextField
          label="Username"
          placeholder="Enter Username"
          icon={User}
        />

        <PasswordField label="Password" placeholder="Enter your password" />

        <PasswordField
          label="Confirm Password"
          placeholder="Confirm your password"
        />

        <AuthButton type="submit">Create Account</AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#B22222]">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
