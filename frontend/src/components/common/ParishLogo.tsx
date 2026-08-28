import type { ImgHTMLAttributes } from "react";

import parishLogo from "@/assets/images/pdf-logo.png";
import { cn } from "@/lib/utils";

interface ParishLogoProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt?: string;
}

export default function ParishLogo({
  alt = "St. Lorenzo Ruiz Parish logo",
  className,
  ...props
}: ParishLogoProps) {
  return (
    <img
      src={parishLogo}
      alt={alt}
      className={cn("block shrink-0 object-contain", className)}
      {...props}
    />
  );
}
