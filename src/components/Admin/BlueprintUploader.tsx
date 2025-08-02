import { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Blueprint } from '@/services/houseService';
import Image from 'next/image';

interface BlueprintUploaderProps {
  onBlueprintChange: (blueprint: Blueprint) => void;
}

export default function BlueprintUploader({ onBlueprintChange }: BlueprintUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const handleFileChange = useCallback((file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, []);

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

  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      setPreviewUrl(url);
    }
  };

  const handleSubmit = () => {
    if (previewUrl && description) {
      onBlueprintChange({
        url: previewUrl,
        description,
        type: 'section',
        imageUrl: ''
      });
      setPreviewUrl(null);
      setDescription('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
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
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Or enter image URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            onChange={handleUrlInput}
          />
        </div>
      </div>

      {previewUrl && (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={previewUrl}
              alt="Blueprint preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="Enter blueprint description"
            />
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-amber-800 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Add Blueprint
          </button>
        </div>
      )}
    </div>
  );
} 