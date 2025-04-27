"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, X, Check, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageChange: (base64: string | null) => void;
  existingImageUrl?: string;
}

export default function ImageUploader({ onImageChange, existingImageUrl }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Validate file
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    // Max size: 2MB
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      onImageChange(base64);
      setIsLoading(false);
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setIsLoading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        ref={fileInputRef} 
        className="hidden" 
      />
      
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-64 object-cover" 
          />
          
          <div className="absolute top-2 right-2 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={triggerFileInput}
              className="p-2 bg-amber-800 text-white rounded-full shadow-md"
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRemoveImage}
              className="p-2 bg-red-600 text-white rounded-full shadow-md"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={triggerFileInput}
          className="w-full h-64 border-2 border-dashed border-amber-300 rounded-lg flex flex-col items-center justify-center p-6 hover:bg-amber-50 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-12 w-12 text-amber-500 mb-3 animate-spin" />
              <p className="text-amber-800 font-medium">Processing image...</p>
            </>
          ) : (
            <>
              <ImagePlus className="h-12 w-12 text-amber-500 mb-3" />
              <p className="text-amber-800 font-medium">Upload Foto Rumah</p>
              <p className="text-gray-500 text-sm mt-1">Klik atau drag & drop (max 2MB)</p>
            </>
          )}
        </motion.button>
      )}
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      
      {preview && (
        <div className="flex items-center mt-2 text-green-600">
          <Check className="h-4 w-4 mr-1" /> 
          <span className="text-sm">Image ready for upload</span>
        </div>
      )}
    </div>
  );
} 