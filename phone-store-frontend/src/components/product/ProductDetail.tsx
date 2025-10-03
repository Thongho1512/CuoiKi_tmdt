import React, { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types/product.types';
import { formatCurrency } from '@/utils/formatters';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ProductDetailProps {
  product: Product;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    addToCart({ productId: product.id, quantity });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    addToCart({ productId: product.id, quantity }).then(() => {
      navigate('/cart');
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Image */}
      <div className="bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={product.imageUrl || '/placeholder-phone.jpg'}
          alt={product.name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600">{product.categoryName}</p>
        </div>

        <div className="text-4xl font-bold text-primary-600">
          {formatCurrency(product.price)}
        </div>

        {/* Stock Status */}
        <div>
          {product.stock > 0 ? (
            <p className="text-green-600 font-medium">
              ✓ Còn hàng ({product.stock} sản phẩm)
            </p>
          ) : (
            <p className="text-red-600 font-medium">✗ Hết hàng</p>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Mô tả sản phẩm</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Thông số kỹ thuật</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {product.specifications}
              </pre>
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        {product.stock > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Số lượng</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <MinusIcon className="h-5 w-5" />
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {product.stock > 0 && (
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Thêm vào giỏ</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
            >
              Mua ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
};