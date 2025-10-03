import { OrderStatus } from '@/types/order.types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPING: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const PAYMENT_METHOD_LABELS = {
  COD: 'Thanh toán khi nhận hàng',
  PAYPAL: 'Thanh toán qua PayPal',
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: 'Chưa thanh toán',
  PAID: 'Đã thanh toán',
};

export const SORT_OPTIONS = [
  { value: 'id-DESC', label: 'Mới nhất' },
  { value: 'price-ASC', label: 'Giá: Thấp đến cao' },
  { value: 'price-DESC', label: 'Giá: Cao đến thấp' },
  { value: 'name-ASC', label: 'Tên: A-Z' },
  { value: 'name-DESC', label: 'Tên: Z-A' },
];

export const ITEMS_PER_PAGE = 12;