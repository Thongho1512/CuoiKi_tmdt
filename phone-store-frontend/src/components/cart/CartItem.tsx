// src/components/cart/CartItem.tsx
import React, { useState, useCallback } from 'react';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CartItem as CartItemType } from '@/types/cart.types';
import { formatCurrency } from '@/utils/formatters';
import { getImageUrl } from '@/utils/imageHelper';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  // ✅ THÊM: State để track image error
  const [imageError, setImageError] = useState(false);

  // ✅ THÊM: Image error handler
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError) {
      setImageError(true);
      e.currentTarget.src = '/placeholder-phone.jpg';
    }
  }, [imageError]);

  const imageUrl = imageError ? '/placeholder-phone.jpg' : getImageUrl(item.productImage);

  return (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
      {/* Image - ✅ SỬA LẠI */}
      <img
        src={imageUrl}
        alt={item.productName}
        className="w-20 h-20 object-cover rounded"
        onError={handleImageError}
        loading="lazy"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.productName}</h3>
        <p className="text-primary-600 font-semibold">{formatCurrency(item.productPrice)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="p-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-12 text-center font-semibold">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-1 border rounded hover:bg-gray-100"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="text-right">
        <p className="font-bold text-lg">{formatCurrency(item.subtotal)}</p>
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );
};