// src/pages/CheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { orderApi } from '@/api/orderApi';
import { userApi } from '@/api/userApi';
import { formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'COD' as 'COD' | 'PAYPAL',
  });

  // Auto-fill user information
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await userApi.getProfile();
      setFormData(prev => ({
        ...prev,
        recipientName: userData.fullName || '',
        recipientPhone: userData.phone || '',
        shippingAddress: userData.address || '',
      }));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setLoadingUserInfo(false);
    }
  };

  const createOrder = async (paymentMethod: 'COD' | 'PAYPAL', paypalOrderId?: string) => {
    const orderData = {
      ...formData,
      paymentMethod,
    };

    try {
      const order = await orderApi.create(orderData);
      
      // If PayPal, update order with PayPal ID
      if (paymentMethod === 'PAYPAL' && paypalOrderId) {
        // The backend will handle PayPal order ID
        console.log('PayPal Order ID:', paypalOrderId);
      }

      return order;
    } catch (error) {
      throw error;
    }
  };

  const handleCODSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await createOrder('COD');
      
      toast.success('Đặt hàng thành công! Email xác nhận đã được gửi.');
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Validate form before allowing payment
  const isFormValid = () => {
    return (
      formData.recipientName.trim() !== '' &&
      formData.recipientPhone.trim() !== '' &&
      formData.shippingAddress.trim() !== ''
    );
  };

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Shipping Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Thông tin nhận hàng</h2>
                
                {loadingUserInfo ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên người nhận *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Nhập họ tên"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.recipientPhone}
                        onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ giao hàng *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={formData.shippingAddress}
                        onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Nhập địa chỉ chi tiết"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú
                      </label>
                      <textarea
                        rows={2}
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Ghi chú thêm về đơn hàng (tùy chọn)"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                
                {!isFormValid() && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Vui lòng điền đầy đủ thông tin nhận hàng trước khi chọn phương thức thanh toán
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {/* COD Payment */}
                  <div
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      formData.paymentMethod === 'COD'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={formData.paymentMethod === 'COD'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: 'COD' })}
                        className="w-5 h-5 text-primary-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          💵 Thanh toán khi nhận hàng (COD)
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Thanh toán bằng tiền mặt khi nhận hàng. Đơn hàng sẽ được xác nhận ngay.
                        </p>
                      </div>
                    </label>
                    
                    {formData.paymentMethod === 'COD' && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={handleCODSubmit}
                          disabled={loading || !isFormValid()}
                          className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center space-x-2">
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>Đang xử lý...</span>
                            </span>
                          ) : (
                            '✅ Xác nhận đặt hàng'
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PayPal Payment */}
                  <div
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      formData.paymentMethod === 'PAYPAL'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        checked={formData.paymentMethod === 'PAYPAL'}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: 'PAYPAL' })}
                        disabled={!isFormValid()}
                        className="w-5 h-5 text-primary-600 mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          💳 Thanh toán qua PayPal
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Thanh toán an toàn qua PayPal. Đơn hàng được xác nhận sau khi thanh toán thành công.
                        </p>
                      </div>
                    </label>

                    {formData.paymentMethod === 'PAYPAL' && isFormValid() && (
                      <div className="mt-4 pt-4 border-t">
                        {PAYPAL_CLIENT_ID ? (
                          <PayPalScriptProvider
                            options={{
                              clientId: PAYPAL_CLIENT_ID,
                              currency: 'USD',
                            }}
                          >
                            <PayPalButtons
                              style={{ layout: 'vertical' }}
                              createOrder={async (data, actions) => {
                                // Convert VND to USD (approximate rate: 1 USD = 25,000 VND)
                                const amountInUSD = (cart.totalAmount / 25000).toFixed(2);
                                
                                return actions.order.create({
                                  intent: 'CAPTURE',
                                  purchase_units: [
                                    {
                                      amount: {
                                        value: amountInUSD,
                                        currency_code: 'USD',
                                      },
                                      description: `Phone Store Order - ${cart.items.length} items`,
                                    },
                                  ],
                                  application_context: {
                                    shipping_preference: 'NO_SHIPPING',
                                  },
                                });
                              }}
                              onApprove={async (data, actions) => {
                                try {
                                  const details = await actions.order!.capture();
                                  console.log('PayPal payment successful:', details);
                                  
                                  // Create order in backend
                                  const order = await createOrder('PAYPAL', details.id);
                                  
                                  toast.success('Thanh toán thành công! Email xác nhận đã được gửi.');
                                  navigate(`/orders/${order.id}`);
                                } catch (error) {
                                  console.error('PayPal payment error:', error);
                                  toast.error('Có lỗi xảy ra khi xử lý thanh toán');
                                }
                              }}
                              onError={(err) => {
                                console.error('PayPal error:', err);
                                toast.error('Có lỗi xảy ra với PayPal');
                              }}
                              onCancel={() => {
                                toast.error('Thanh toán đã bị hủy');
                              }}
                            />
                          </PayPalScriptProvider>
                        ) : (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              ⚠️ PayPal chưa được cấu hình. Vui lòng thêm VITE_PAYPAL_CLIENT_ID vào file .env
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Notification Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-medium text-blue-900">Email xác nhận</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận với thông tin chi tiết đơn hàng tại: <strong>{user?.email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm pb-3 border-b">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-gray-600 text-xs mt-1">
                        {formatCurrency(item.productPrice)} x {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 ml-4">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatCurrency(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-semibold text-green-600">Miễn phí</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold text-gray-900">Tổng cộng:</span>
                  <span className="font-bold text-primary-600 text-xl">
                    {formatCurrency(cart.totalAmount)}
                  </span>
                </div>
              </div>

              {formData.paymentMethod === 'PAYPAL' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    💱 Tỷ giá: ~{(cart.totalAmount / 25000).toFixed(2)} USD
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (Tỷ giá quy đổi: 1 USD ≈ 25,000 VNĐ)
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <span>🔒</span>
                  <p>Thông tin của bạn được bảo mật và mã hóa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};