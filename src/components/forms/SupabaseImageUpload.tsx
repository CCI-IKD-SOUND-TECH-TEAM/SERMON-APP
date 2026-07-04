import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface SupabaseImageUploadProps {
  value: File | string | null;
  onChange: (value: File | string | null) => void;
  label?: string;
  hint?: string;
}

export function SupabaseImageUpload({ value, onChange, label, hint }: SupabaseImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const handleSelectFile = (file: File) => {
    if (!file) return;
    onChange(file);
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
          
          <div className="flex flex-col items-center text-ink-muted">
            <UploadCloud className="w-10 h-10 mb-3 text-ink-muted" />
            <span className="font-semibold text-sm text-ink mb-1">Click to select cover image</span>
            <span className="text-xs">SVG, PNG, JPG or GIF (max. 5MB)</span>
          </div>
        </div>
      )}
      
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </div>
  );
}
