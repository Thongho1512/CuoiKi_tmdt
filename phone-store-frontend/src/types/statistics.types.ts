export interface Statistics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus?: Record<string, number>;
  revenueByMonth?: Record<string, number>;
}