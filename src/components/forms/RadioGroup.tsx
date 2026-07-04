import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ label, options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2 mb-4">
      {label && (
        <label className="text-xs font-semibold text-ink-muted uppercase tracking-wide font-body">
          {label}
        </label>
      )}
      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-4 rounded-md border-2 cursor-pointer transition-all ${
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-ink-muted'
              }`}
            >
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'border-primary' : 'border-ink-muted'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="flex flex-col gap-1">
                <span className={`font-semibold text-sm ${isSelected ? 'text-primary-dark' : 'text-ink'}`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-sm text-ink-muted">
                    {opt.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
