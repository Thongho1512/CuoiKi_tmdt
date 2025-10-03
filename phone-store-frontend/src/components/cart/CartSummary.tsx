import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';

interface CartSummaryProps {
  totalAmount: number;
  totalItems: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ totalAmount, totalItems }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Tổng sản phẩm:</span>
          <span className="font-semibold">{totalItems}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tạm tính:</span>
          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển:</span>
          <span className="font-semibold">Miễn phí</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-lg">
          <span className="font-bold">Tổng cộng:</span>
          <span className="font-bold text-primary-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        disabled={totalItems === 0}
        className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Tiến hành đặt hàng
      </button>
    </div>
  );
};