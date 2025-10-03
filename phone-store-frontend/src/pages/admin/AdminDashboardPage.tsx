// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import {
  UserGroupIcon,
  DevicePhoneMobileIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { statisticsApi } from '@/api/statisticsApi';
import { Statistics } from '@/types/statistics.types';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 break-words">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} flex-shrink-0 ml-4`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-600">{payload[0].payload.month}</p>
        <p className="text-lg font-bold text-primary-600">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const AdminDashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const data = await statisticsApi.getDashboard();
      console.log('Statistics data:', data); // Debug
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Prepare chart data with proper formatting
  const revenueChartData = statistics?.revenueByMonth
    ? Object.entries(statistics.revenueByMonth).map(([month, revenue]) => ({
        month: month,
        revenue: Number(revenue) || 0,
        displayRevenue: formatCurrency(Number(revenue) || 0),
      }))
    : [];

  // Calculate total revenue properly
  const totalRevenue = statistics?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Tổng quan hệ thống</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatCurrency(totalRevenue)}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
        />
        <StatCard
          title="Tổng đơn hàng"
          value={formatNumber(statistics?.totalOrders || 0)}
          icon={ShoppingBagIcon}
          color="bg-blue-500"
        />
        <StatCard
          title="Khách hàng"
          value={formatNumber(statistics?.totalCustomers || 0)}
          icon={UserGroupIcon}
          color="bg-purple-500"
        />
        <StatCard
          title="Sản phẩm"
          value={formatNumber(statistics?.totalProducts || 0)}
          icon={DevicePhoneMobileIcon}
          color="bg-orange-500"
        />
      </div>

      {/* Revenue Chart */}
      {revenueChartData.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo tháng (12 tháng gần nhất)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#888"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={() => 'Doanh thu (VNĐ)'}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: '#4f46e5', r: 4 }}
                activeDot={{ r: 6 }}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Orders by Status */}
      {statistics?.ordersByStatus && Object.keys(statistics.ordersByStatus).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Đơn hàng theo trạng thái</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(statistics.ordersByStatus).map(([status, count]) => (
              <div key={status} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <p className="text-3xl font-bold text-primary-600">{count}</p>
                <p className="text-sm text-gray-600 mt-1 font-medium">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!statistics || 
          ((!statistics.totalRevenue || statistics.totalRevenue === 0) && 
           (!statistics.totalOrders || statistics.totalOrders === 0))) && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Chưa có dữ liệu thống kê</p>
          <p className="text-sm text-gray-400 mt-2">Dữ liệu sẽ được hiển thị khi có đơn hàng</p>
        </div>
      )}
    </div>
  );
};