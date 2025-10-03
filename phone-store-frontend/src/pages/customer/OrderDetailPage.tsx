import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OrderDetail } from '@/types';
import { orderApi } from '@/api/orderApi';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder(parseInt(id));
    }
  }, [id]);

  const fetchOrder = async (orderId: number) => {
    try {
      const data = await orderApi.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await orderApi.cancel(order.id);
      toast.success('Hủy đơn hàng thành công');
      fetchOrder(order.id);
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Quay lại danh sách</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
              <p className="text-gray-600 mt-1">Mã đơn hàng: {order.orderCode}</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                ORDER_STATUS_COLORS[order.status]
              }`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Ngày đặt hàng</p>
              <p className="font-medium">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phương thức thanh toán</p>
              <p className="font-medium">
                {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'PayPal'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Trạng thái thanh toán</p>
              <p className="font-medium">
                {order.paymentStatus === 'PAID' ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
              </p>
            </div>
            {order.paidAt && (
              <div>
                <p className="text-sm text-gray-600">Ngày thanh toán</p>
                <p className="font-medium">{formatDateTime(order.paidAt)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin nhận hàng</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Người nhận</p>
              <p className="font-medium">{order.recipientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium">{order.recipientPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Địa chỉ giao hàng</p>
              <p className="font-medium">{order.shippingAddress}</p>
            </div>
            {order.note && (
              <div>
                <p className="text-sm text-gray-600">Ghi chú</p>
                <p className="font-medium">{order.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Sản phẩm đã đặt</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
                <p className="text-lg font-semibold">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between text-xl font-bold">
              <span>Tổng cộng:</span>
              <span className="text-primary-600">{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Order Tracking */}
        {order.trackings && order.trackings.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Theo dõi đơn hàng</h2>
            <div className="space-y-4">
              {order.trackings.map((tracking, index) => (
                <div key={tracking.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {order.trackings.length - index}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ORDER_STATUS_COLORS[tracking.status]
                        }`}
                      >
                        {ORDER_STATUS_LABELS[tracking.status]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(tracking.createdAt)}
                      </span>
                    </div>
                    {tracking.description && (
                      <p className="text-gray-700 mt-1">{tracking.description}</p>
                    )}
                    {tracking.location && (
                      <p className="text-sm text-gray-500 mt-1">📍 {tracking.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {order.status === 'PENDING' && (
          <div className="flex justify-end">
            <button
              onClick={handleCancelOrder}
              className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
            >
              <XMarkIcon className="h-5 w-5" />
              <span>Hủy đơn hàng</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};