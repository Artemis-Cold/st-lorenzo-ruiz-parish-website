import { AlertCircle } from "lucide-react";

interface AlertBannerProps {
  message: string;
}

export default function AlertBanner({ message }: AlertBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}