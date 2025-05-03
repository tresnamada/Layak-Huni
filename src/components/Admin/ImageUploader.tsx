"use client";

import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageChange: (image: string | null) => void;
  initialImage?: string | null;
}

export default function ImageUploader({ onImageChange, initialImage = null }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage);

  const handleFileChange = useCallback((file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        onImageChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      handleFileChange(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif')) {
      handleFileChange(file);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,image/png,image/gif"
          className="hidden"
          onChange={handleFileInput}
        />
        <Upload className="w-8 h-8 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop an image, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports JPG, PNG, GIF
        </p>
      </div>

      {previewUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="House preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
} 