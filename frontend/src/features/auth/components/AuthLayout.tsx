import type { ReactNode } from "react";
import authBg from "../../../assets/images/auth-bg.png";
import ParishLogo from "@/components/common/ParishLogo";
import AuthHeader from "./AuthHeader";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage: `url(${authBg})`,
      }}
    >
      <AuthHeader />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Logo */}
        <span className="mb-6 grid size-21 place-items-center rounded-full bg-white p-1.5 shadow-xl ring-4 ring-white/70">
          <ParishLogo className="size-full" />
        </span>

        {/* Card */}
        <div className="w-full rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-center font-serif text-3xl font-bold text-[#B22222]">
            {title}
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
