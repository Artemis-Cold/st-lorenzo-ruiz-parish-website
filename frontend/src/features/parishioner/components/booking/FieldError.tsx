import { useEffect, useId, useRef } from "react";

/** Associates an existing inline error with its adjacent field. */
export default function FieldError({ message }: { message?: string }) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (!message) return;
    const container = ref.current?.parentElement;
    const controls = container?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("input:not([type=hidden]), select, textarea");
    // Group-level errors must not be attached to an arbitrary child field.
    if (!controls || controls.length !== 1) return;
    const control = controls[0];
    const previousInvalid = control.getAttribute("aria-invalid");
    const previousDescription = control.getAttribute("aria-describedby");
    const previousLabel = control.getAttribute("aria-label");
    const label = container?.querySelector("label")?.textContent?.trim();
    if (!previousLabel && !control.labels?.length && label)
      control.setAttribute("aria-label", label);
    control.setAttribute("aria-invalid", "true");
    control.setAttribute(
      "aria-describedby",
      [previousDescription, id].filter(Boolean).join(" "),
    );
    control.classList.add("ring-2", "ring-red-600", "scroll-mt-24");
    return () => {
      if (previousInvalid === null) control.removeAttribute("aria-invalid");
      else control.setAttribute("aria-invalid", previousInvalid);
      if (previousDescription === null)
        control.removeAttribute("aria-describedby");
      else control.setAttribute("aria-describedby", previousDescription);
      if (previousLabel === null) control.removeAttribute("aria-label");
      else control.setAttribute("aria-label", previousLabel);
      control.classList.remove("ring-2", "ring-red-600", "scroll-mt-24");
    };
  }, [message, id]);
  return message ? (
    <p
      ref={ref}
      id={id}
      data-booking-field-error
      tabIndex={-1}
      className="mt-2 text-sm font-medium text-red-700"
    >
      <span aria-hidden="true">⚠ </span>
      {message}
    </p>
  ) : null;
}
