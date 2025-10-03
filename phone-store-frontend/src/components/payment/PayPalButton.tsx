import React from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { orderApi } from '@/api/orderApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosConfig';

interface PayPalButtonProps {
  orderId: number;
  amount: number;
  onSuccess: () => void;
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test';

export const PayPalButtonComponent: React.FC<PayPalButtonProps> = ({
  orderId,
  amount,
  onSuccess,
}) => {
  const navigate = useNavigate();

  const createOrder = async () => {
    try {
      const response = await axiosInstance.post('/payment/paypal/create-order', {
        orderId: orderId,
      });
      return response.data.orderId;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      toast.error('Không thể tạo thanh toán PayPal');
      throw error;
    }
  };

  const onApprove = async (data: any) => {
    try {
      await axiosInstance.post('/payment/paypal/capture-order', null, {
        params: {
          paymentId: data.orderID,
          payerId: data.payerID,
          orderId: orderId,
        },
      });
      
      toast.success('Thanh toán thành công!');
      onSuccess();
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      toast.error('Thanh toán thất bại');
    }
  };

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: 'USD',
      }}
    >
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          console.error('PayPal error:', err);
          toast.error('Có lỗi xảy ra với PayPal');
        }}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
        }}
      />
    </PayPalScriptProvider>
  );
}