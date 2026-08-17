import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface FileUploadFieldProps {
  label: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  readOnly?: boolean;
}

export default function FileUploadField({
  label,
  required = false,
  file,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  readOnly,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const openPicker = () => {
    if (readOnly) return;

    inputRef.current?.click();
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      <input
        ref={inputRef}
        hidden
        type="file"
        accept={accept}
        disabled={readOnly}
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] ?? null;

          if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
            setSizeError("The file must not exceed 5 MB.");
            e.target.value = "";
            return;
          }

          setSizeError(null);
          onChange(selectedFile);
        }}
      />

      {sizeError && (
        <p className="mb-2 text-sm text-red-600">{sizeError}</p>
      )}

      {readOnly ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          {file ? (
            <div className="flex items-start gap-3">
              <FileText className="mt-1 text-green-600" size={28} />

              <div className="flex-1">
                <p className="font-semibold text-gray-800">{file.name}</p>

                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Ready to submit
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-400">
              <FileText size={24} />

              <span className="italic">No file uploaded.</span>
            </div>
          )}
        </div>
      ) : !file ? (
        <button
          type="button"
          onClick={openPicker}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition hover:border-[#B22222] hover:bg-red-50"
        >
          <Upload size={40} className="mb-3 text-[#B22222]" />

          <p className="font-semibold">Select Document</p>

          <p className="mt-1 text-sm text-gray-500">Click to browse</p>

          <p className="mt-2 text-xs text-gray-400">PDF, JPG, PNG (Max 5 MB)</p>
        </button>
      ) : (
        <div className="rounded-2xl border border-green-300 bg-green-50 p-5">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <FileText className="mt-1 text-green-600" size={28} />

              <div>
                <p className="font-semibold">{file.name}</p>

                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

                <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Ready to submit
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSizeError(null);
                onChange(null);
              }}
              className="rounded-lg p-2 transition hover:bg-red-100"
            >
              <X size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={openPicker}
            className="mt-5 rounded-xl bg-[#B22222] px-4 py-2 text-sm text-white transition hover:bg-[#8B1C1C]"
          >
            Replace File
          </button>
        </div>
      )}
    </div>
  );
}
