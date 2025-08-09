// components/ImageUploader.tsx
"use client";
import {  useRef } from 'react';

export default function ImageUploader({ onUpload }: { 
  onUpload: (base64: string) => void 
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpload(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload Ruangan
      </button>
    </div>
  );
}