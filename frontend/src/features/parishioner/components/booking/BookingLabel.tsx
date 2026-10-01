import {
  Children,
  isValidElement,
  type ReactNode,
  type ComponentProps,
} from "react";
import { translateBookingLabel } from "./bookingTranslations";

function labelText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child): string => {
      if (typeof child === "string" || typeof child === "number")
        return String(child);
      if (!isValidElement<{ children?: ReactNode }>(child)) return "";
      if (
        typeof child.type === "string" &&
        ["input", "select", "textarea", "button"].includes(child.type)
      )
        return "";
      return labelText(child.props.children);
    })
    .join(" ");
}

export function BookingTranslation({
  text,
  className = "mt-1 block text-xs font-normal normal-case tracking-normal opacity-80",
}: {
  text: string;
  className?: string;
}) {
  const translation = translateBookingLabel(text);
  return translation ? (
    <span lang="tl" className={className}>
      {translation}
    </span>
  ) : null;
}

export default function BookingLabel({
  children,
  className = "",
  ...props
}: ComponentProps<"label">) {
  return (
    <label {...props} className={`${className} flex-wrap`}>
      {children}
      <span className="basis-full">
        <BookingTranslation text={labelText(children)} />
      </span>
    </label>
  );
}
