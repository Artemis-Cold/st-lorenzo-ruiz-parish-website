interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirming?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
  confirming = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div data-app-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg">
        <h3 className="font-serif text-lg font-bold text-[#292524]">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 rounded-xl border border-[#E7E2DA] py-2.5 font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            {confirming ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
