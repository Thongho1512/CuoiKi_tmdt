export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPING' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'PAYPAL';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderTracking {
  id: number;
  orderId: number;
  status: OrderStatus;
  description?: string;
  location?: string;
  updatedBy: string;
  createdAt: string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  username: string;
  totalPrice: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  note?: string;
  paypalOrderId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends Order {
  userEmail: string;
  userPhone?: string;
  items: OrderItem[];
  trackings: OrderTracking[];
}

export interface CreateOrderRequest {
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  description?: string;
  location?: string;
}