"use client";

import React, {
  useState,
  useRef,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import { X, Upload, Link as LinkIcon, FileText, Sparkles } from "lucide-react";
import { addLearning } from "@/lib/api/learning-client";
import type { Learning } from "@/lib/api/learning-types";

interface AddLearningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (learning: Learning) => void;
}

export const AddLearningDialog: React.FC<AddLearningDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [topic, setTopic] = useState<string>("flutter");
  const [url, setUrl] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Clipboard paste listener for images
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setImageUrl(""); // Clear URL input if pasting directly
            setError(null);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setImageUrl("");
        setError(null);
      } else {
        setError("Please drop an image file.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageUrl("");
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setUrl("");
    setTitle("");
    setText("");
    setImage(null);
    setImageUrl("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !text && !image && !imageUrl.trim()) {
      setError(
        "Please provide a URL, text content, image upload, or image URL.",
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("topic", topic);
      if (url.trim()) formData.append("url", url.trim());
      if (title.trim()) formData.append("title", title.trim());
      if (text.trim()) formData.append("text", text.trim());
      if (imageUrl.trim()) formData.append("imageUrl", imageUrl.trim());
      if (image) formData.append("image", image);

      const result = await addLearning(formData);
      onSuccess(result);
      handleClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to save learning content.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-xl rounded-2xl glass p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="text-lg font-bold text-white">Add New Learning</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Topic Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Topic
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTopic("flutter")}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer"
                style={
                  topic === "flutter"
                    ? {
                        background: "rgba(2, 125, 253, 0.15)",
                        color: "#027DFD",
                        borderColor: "#027DFD",
                      }
                    : {
                        background: "var(--bg-card)",
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                      }
                }
              >
                Flutter
              </button>
              <button
                type="button"
                onClick={() => setTopic("android")}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer"
                style={
                  topic === "android"
                    ? {
                        background: "rgba(61, 220, 132, 0.15)",
                        color: "#3DDC84",
                        borderColor: "#3DDC84",
                      }
                    : {
                        background: "var(--bg-card)",
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                      }
                }
              >
                Android
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="learning-title"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Title (Optional)
            </label>
            <input
              id="learning-title"
              type="text"
              placeholder="e.g. Flutter 3.22 Deep Linking Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-sm rounded-lg outline-none transition-all duration-200 border bg-black/20 focus:ring-1 focus:ring-indigo-500/50"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Source URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="learning-url"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Source URL
            </label>
            <div className="relative flex items-center">
              <LinkIcon className="absolute left-3 w-4 h-4 text-neutral-500" />
              <input
                id="learning-url"
                type="url"
                placeholder="https://medium.com/... or LinkedIn URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all duration-200 border bg-black/20 focus:ring-1 focus:ring-indigo-500/50"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="learning-text"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-400"
            >
              Text Content / Notes
            </label>
            <div className="relative flex items-start">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
              <textarea
                id="learning-text"
                placeholder="Paste core takeaways, snippet code, or social post text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none transition-all duration-200 border bg-black/20 focus:ring-1 focus:ring-indigo-500/50 resize-none"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          </div>

          {/* Image Upload or URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Screenshot / Image (Upload, Paste image file, or Paste image URL)
            </label>
            {previewUrl || imageUrl.trim() ? (
              <div
                className="relative rounded-xl border overflow-hidden group aspect-video max-h-48"
                style={{ borderColor: "var(--border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl || imageUrl.trim()}
                  alt="Upload preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // handle invalid image URLs gracefully
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} /> Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 bg-black/10 hover:bg-black/20 ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-500/5"
                      : "border-neutral-700"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-neutral-500 mb-2 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-xs font-medium text-neutral-300 text-center">
                    Drag and drop image here, or{" "}
                    <span className="text-indigo-400 hover:underline">
                      browse
                    </span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Supports clipboard copy-paste (Ctrl+V / Cmd+V) directly
                    inside dialog
                  </p>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-neutral-500">
                    URL:
                  </span>
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (e.g. https://.../image.png)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-12 pr-3 py-2 text-xs rounded-lg outline-none transition-all duration-200 border bg-black/20 focus:ring-1 focus:ring-indigo-500/50"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Sparkles size={14} /> Save Learning
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddLearningDialog;
