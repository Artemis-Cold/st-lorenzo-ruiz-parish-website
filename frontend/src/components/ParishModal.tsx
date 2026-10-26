import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";

export default function ParishModal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const returnFocus = useRef(document.activeElement as HTMLElement | null);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-[#E7E2DA] bg-white shadow-2xl focus:outline-none"
        >
          <header className="flex items-start justify-between gap-4 border-b border-[#E7E2DA] bg-[#FAF8F5] px-5 py-5 sm:px-6">
            <div>
              <Dialog.Title className="font-serif text-xl font-bold text-[#292524]">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-gray-500">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="rounded-full p-2 text-gray-500 hover:bg-white"
              aria-label="Close dialog"
            >
              <X size={20} />
            </Dialog.Close>
          </header>
          <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
