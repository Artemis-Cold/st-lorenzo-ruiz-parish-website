import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { AxiosError } from "axios";
import { Camera, ImagePlus, ZoomIn } from "lucide-react";
import { toast } from "sonner";

import { updateProfilePhoto } from "@/api/auth";
import ProfileModal from "./ProfileModal";

interface ProfilePhotoModalProps {
  currentPhoto?: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

const OUTPUT_SIZE = 512;

export default function ProfilePhotoModal({
  currentPhoto,
  onClose,
  onSaved,
}: ProfilePhotoModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("profile-photo.jpg");
  const [zoom, setZoom] = useState(1);
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const shortestSide = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceSize = shortestSide / zoom;
    const availableX = Math.max(0, image.naturalWidth - sourceSize);
    const availableY = Math.max(0, image.naturalHeight - sourceSize);
    const sourceX = (availableX / 2) * (1 + horizontal / 100);
    const sourceY = (availableY / 2) * (1 + vertical / 100);

    context.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );
  }, [horizontal, image, vertical, zoom]);

  const selectPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const selectedImage = new Image();
    selectedImage.onload = () => {
      setImage(selectedImage);
      setFileName(file.name.replace(/\.[^.]+$/, "") + "-cropped.jpg");
      setZoom(1);
      setHorizontal(0);
      setVertical(0);
      setError(null);
      URL.revokeObjectURL(objectUrl);
    };
    selectedImage.onerror = () => {
      setError("That image could not be opened. Please choose another file.");
      URL.revokeObjectURL(objectUrl);
    };
    selectedImage.src = objectUrl;
  };

  const savePhoto = async () => {
    if (!canvasRef.current || !image) return;
    setSaving(true);
    setError(null);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvasRef.current?.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Crop failed")),
          "image/jpeg",
          0.9,
        );
      });
      await updateProfilePhoto(
        new File([blob], fileName, { type: "image/jpeg" }),
      );
      await onSaved();
      toast.success("Profile photo updated successfully.");
      onClose();
    } catch (uploadError) {
      if (uploadError instanceof AxiosError && uploadError.response?.status === 422) {
        setError(
          uploadError.response.data.errors?.profile_photo?.[0] ??
            "The cropped photo could not be uploaded.",
        );
      } else {
        setError("Unable to update your profile photo. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileModal
      title="Update Profile Photo"
      description="Choose a photo, adjust the crop, then save your changes."
      onClose={onClose}
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        <div className="mx-auto grid size-64 place-items-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-[0_0_0_1px_#e5e7eb] sm:size-72">
          {image ? (
            <canvas
              ref={canvasRef}
              width={OUTPUT_SIZE}
              height={OUTPUT_SIZE}
              className="size-full object-cover"
            />
          ) : currentPhoto ? (
            <img src={currentPhoto} alt="Current profile" className="size-full object-cover" />
          ) : (
            <Camera size={64} className="text-gray-300" />
          )}
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B22222]/50 bg-red-50 px-4 py-3 font-semibold text-[#B22222] transition hover:bg-red-100">
          <ImagePlus size={19} />
          {image ? "Choose a Different Photo" : "Choose Photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={selectPhoto}
            className="sr-only"
          />
        </label>

        {image && (
          <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
            <label className="block text-sm font-medium text-gray-700">
              <span className="mb-2 flex items-center gap-2">
                <ZoomIn size={16} /> Zoom
              </span>
              <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-full accent-[#B22222]" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-2 block">Move left or right</span>
                <input type="range" min="-100" max="100" value={horizontal} onChange={(event) => setHorizontal(Number(event.target.value))} className="w-full accent-[#B22222]" />
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-2 block">Move up or down</span>
                <input type="range" min="-100" max="100" value={vertical} onChange={(event) => setVertical(Number(event.target.value))} className="w-full accent-[#B22222]" />
              </label>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-500">
          The saved image will be square and optimized as a JPG.
        </p>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={savePhoto} disabled={!image || saving} className="rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white transition hover:bg-[#991B1B] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? "Saving Photo..." : "Save Cropped Photo"}
          </button>
        </div>
      </div>
    </ProfileModal>
  );
}
