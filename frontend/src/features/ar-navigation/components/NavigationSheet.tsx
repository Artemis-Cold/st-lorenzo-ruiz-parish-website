import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export default function NavigationSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="nav-sheet"
      aria-labelledby="nav-sheet-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="nav-sheet-inner">
        <header>
          <h2 id="nav-sheet-title">{title}</h2>
          <button
            className="nav-icon nav-icon-light"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X size={20} />
          </button>
        </header>
        <div className="nav-sheet-content">{children}</div>
      </div>
    </dialog>
  );
}
