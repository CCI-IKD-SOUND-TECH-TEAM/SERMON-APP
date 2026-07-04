import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUpload({ value, onChange, label, hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) {
      setError('File size must be less than 3MB.');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      
      if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary credentials missing in .env.local');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Failed to upload image');
      }

      const data = await res.json();
      onChange(data.secure_url);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
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
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4">
      {label && (
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">
          {label}
        </label>
      )}
      
      {value ? (
        <div className="relative rounded-sm border border-border overflow-hidden bg-surface group" style={{ aspectRatio: '3/4', maxWidth: 300 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => onChange('')}
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
                handleUpload(e.target.files[0]);
              }
            }}
          />
          
          {uploading ? (
            <div className="flex flex-col items-center text-ink-muted">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <span className="font-semibold text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-ink-muted">
              <UploadCloud className="w-10 h-10 mb-3 text-ink-muted" />
              <span className="font-semibold text-sm text-ink mb-1">Click to upload or drag and drop</span>
              <span className="text-xs">SVG, PNG, JPG or GIF (max. 3MB)</span>
            </div>
          )}
        </div>
      )}
      
      {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
      <p className="text-xs text-ink-muted mt-1">
        Image too large? Use <a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Squoosh</a> to reduce the file size.
      </p>
    </div>
  );
}
