import React from 'react';
import { FileUploadField } from './FileUploadField';

interface FileUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  helperText?: string;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  accept,
  helperText
}) => {
  return (
    <FileUploadField
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      accept={accept}
      helperText={helperText}
      type="document"
    />
  );
};
