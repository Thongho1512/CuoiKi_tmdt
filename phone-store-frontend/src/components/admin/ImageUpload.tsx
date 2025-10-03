import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  currentImage?: string;
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageSelect,
  onImageRemove,
  label = 'Hình ảnh',
  accept = 'image/jpeg,image/png,image/jpg,image/gif,image/webp',
  maxSize = 5,
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    if (!validTypes.includes(fileType)) {
      setError('Định dạng file không hợp lệ. Chỉ chấp nhận: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`Kích thước file không được vượt quá ${maxSize}MB`);
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Pass file to parent
    onImageSelect(file);
  };

  const handleRemove = () => {
    setPreview(undefined);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-start space-x-4">
        {/* Preview or Upload Button */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg border-2 border-gray-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-phone.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary-500 hover:bg-gray-50 transition-colors"
            >
              <PhotoIcon className="h-12 w-12 text-gray-400" />
              <span className="mt-2 text-xs text-gray-500">Tải ảnh lên</span>
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!preview && (
            <button
              type="button"
              onClick={handleClick}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Chọn ảnh
            </button>
          )}

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>• Định dạng: JPG, PNG, GIF, WebP</p>
            <p>• Kích thước tối đa: {maxSize}MB</p>
            <p>• Khuyến nghị: 800x800px</p>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};