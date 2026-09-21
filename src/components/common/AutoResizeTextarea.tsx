import React, { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  error?: string;
  id?: string;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Введите текст...',
  minRows = 3,
  maxRows,
  className = '',
  disabled = false,
  required = false,
  helperText,
  error,
  id
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the exact scrollHeight
    textarea.style.height = 'auto';

    // Calculate line height approximation based on font size
    const singleRowHeight = 22; // approx 22px per row for text-sm
    const minHeight = minRows * singleRowHeight + 18; // plus padding
    const scrollHeight = textarea.scrollHeight;

    if (maxRows) {
      const maxHeight = maxRows * singleRowHeight + 18;
      textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    } else {
      textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
      textarea.style.overflowY = 'hidden';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, minRows, maxRows]);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block font-semibold text-slate-500 text-sm mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          placeholder={placeholder}
          rows={minRows}
          className={`w-full px-4.5 py-2.5 rounded-xl border text-sm transition-all resize-none outline-none leading-relaxed ${
            error
              ? 'border-red-400 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400'
              : 'border-gray-300 bg-white text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs'
          } ${disabled ? 'opacity-60 bg-gray-100 cursor-not-allowed' : ''} ${className}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
