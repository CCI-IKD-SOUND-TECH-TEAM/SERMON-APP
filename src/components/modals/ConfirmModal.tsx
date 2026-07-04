import React from 'react';
import { Button } from '@/components/core/Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="bg-surface w-full max-w-[400px] rounded-lg shadow-modal p-6 border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className="font-h3 text-ink mb-2">
          {title}
        </h2>
        <div className="font-body text-ink-muted mb-6">
          {message}
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} loading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
