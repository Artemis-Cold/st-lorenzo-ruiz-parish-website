import { XCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/alert-dialog";

interface Props {
  label?: string;
  itemLabel: string;
  onConfirm: () => void;
  className?: string;
}

export default function RejectConfirmationButton({
  label = "Reject",
  itemLabel,
  onConfirm,
  className,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={className ?? "flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"}
        >
          <XCircle size={18} />
          {label}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will mark the {itemLabel} as rejected. Please confirm that you
            have reviewed the submitted information before continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep pending</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-[#B22222] hover:bg-[#991B1B]"
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
