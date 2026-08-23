// components/common/Logo.tsx
import logo from "@/assets/images/parish-logo.png";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="San Lorenzo Ruiz Parish Logo"
        className="h-10 w-10"
      />

      <div>
        <h1 className="text-lg font-semibold">St. Lorenzo Ruiz Parish</h1>

        <p className="text-xs text-gray-500">Dagatan, Taysan, Batangas</p>
      </div>
    </div>
  );
}
