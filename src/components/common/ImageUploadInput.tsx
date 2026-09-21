import React from 'react';
import { FileUploadField } from './FileUploadField';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  multiline?: boolean;
  type?: 'image' | 'video' | 'auto';
  helperText?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  placeholder,
  label,
  className = '',
  multiline = false,
  type = 'image',
  helperText
}) => {
  return (
    <FileUploadField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      multiline={multiline}
      type={type}
      helperText={helperText}
    />
  );
};
