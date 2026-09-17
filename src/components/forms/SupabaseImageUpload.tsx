import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

interface SupabaseImageUploadProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  label?: string;
  hint?: string;
}

// Downscale + recompress before upload so stored covers stay small.
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

async function prepareCoverFile(file: File): Promise<File> {
  // Animated GIFs and SVGs shouldn't be flattened through a canvas.
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } finally {
    bitmap.close();
  }
}

export function SupabaseImageUpload({ value, onChange, label, hint }: SupabaseImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    if (typeof value === 'string') {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleSelectFile = async (file: File) => {
    if (!file) return;
    setError(null);

    if (file.size > MAX_ORIGINAL_BYTES) {
      setError('That image is too large. Please choose a file under 25MB.');
      return;
    }

    setProcessing(true);
    try {
      const prepared = await prepareCoverFile(file);
      onChange(prepared);
    } catch {
      setError('Could not process that image. Try a different file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && (
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">
          {label}
        </label>
      )}
      
      {previewUrl ? (
        <div className="relative rounded-sm border border-border overflow-hidden bg-surface group" style={{ aspectRatio: '3/4', maxWidth: 300 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-danger text-white px-3 py-1.5 rounded-sm font-semibold text-sm hover:bg-danger-dark transition-colors cursor-pointer border-none flex items-center gap-2"
            >
              <X size={16} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-ink-muted bg-surface'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{ aspectRatio: '3/4', maxWidth: 300 }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleSelectFile(e.target.files[0]);
              }
            }}
          />
          
          {processing ? (
            <div className="flex flex-col items-center text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <span className="font-semibold text-sm">Processing image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-ink-muted">
              <UploadCloud className="w-10 h-10 mb-3 text-ink-muted" />
              <span className="font-semibold text-sm text-ink mb-1">Click to select cover image</span>
              <span className="text-xs">SVG, PNG, JPG or GIF (max. 25MB, auto-resized)</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}
