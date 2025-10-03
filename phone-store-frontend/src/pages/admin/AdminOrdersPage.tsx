import React, { useEffect, useState } from 'react';
import { Order, OrderDetail, PageResponse, OrderStatus } from '@/types';
import { orderApi } from '@/api/orderApi';
import { DataTable } from '@/components/admin/DataTable';
import { SearchBar } from '@/components/admin/SearchBar';
import { Modal } from '@/components/admin/Modal';
import { Pagination } from '@/components/common/Pagination';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/utils/constants';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<PageResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [statusDescription, setStatusDescription] = useState('');
  const [statusLocation, setStatusLocation] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, debouncedSearch, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let data;
      if (debouncedSearch) {
        data = await orderApi.searchOrders(debouncedSearch, currentPage, 10);
      } else if (filterStatus) {
        data = await orderApi.getOrdersByStatus(filterStatus, currentPage, 10);
      } else {
        data = await orderApi.getAllOrders(currentPage, 10);
      }
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: Order) => {
    try {
      const detail = await orderApi.getById(order.id);
      setSelectedOrder(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order as OrderDetail);
    setNewStatus(order.status);
    setStatusDescription('');
    setStatusLocation('');
    setShowStatusModal(true);
  };

  const handleSubmitStatus = async () => {
    if (!selectedOrder) return;

    try {
      await orderApi.updateStatus(selectedOrder.id, {
        status: newStatus,
        description: statusDescription,
        location: statusLocation,
      });
      toast.success('Cập nhật trạng thái thành công');
      setShowStatusModal(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const columns = [
    { key: 'orderCode', label: 'Mã đơn hàng' },
    { key: 'recipientName', label: 'Người nhận' },
    { key: 'recipientPhone', label: 'SĐT' },
    {
      key: 'totalPrice',
      label: 'Tổng tiền',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: OrderStatus) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[value]}`}>
          {ORDER_STATUS_LABELS[value]}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      label: 'Thanh toán',
      render: (value: string) => (
        <span className="text-sm">{value === 'COD' ? 'COD' : 'PayPal'}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày đặt',
      render: (value: string) => formatDateTime(value),
    },
  ];

  const orderStatuses: OrderStatus[] = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPING',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
          <p className="text-gray-600">Tổng số: {orders?.totalElements || 0} đơn hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm theo mã đơn, tên, SĐT..."
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as OrderStatus | '');
            setCurrentPage(0);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Tất cả trạng thái</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {ORDER_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <DataTable
        data={orders?.content || []}
        columns={columns}
        onView={handleViewOrder}
        onEdit={handleUpdateStatus}
        loading={loading}
      />

      {/* Pagination */}
      {orders && orders.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={orders.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết đơn hàng"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã đơn hàng</label>
                <p className="mt-1 text-lg font-semibold text-primary-600">
                  {selectedOrder.orderCode}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    ORDER_STATUS_COLORS[selectedOrder.status]
                  }`}
                >
                  {ORDER_STATUS_LABELS[selectedOrder.status]}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Thông tin khách hàng</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm text-gray-600">Họ tên</label>
                  <p className="font-medium">{selectedOrder.recipientName}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Số điện thoại</label>
                  <p className="font-medium">{selectedOrder.recipientPhone}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600">Địa chỉ giao hàng</label>
                  <p className="font-medium">{selectedOrder.shippingAddress}</p>
                </div>
                {selectedOrder.note && (
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600">Ghi chú</label>
                    <p className="font-medium">{selectedOrder.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Sản phẩm đã đặt</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatCurrency(selectedOrder.totalPrice)}
                </span>
              </div>
            </div>

            {/* Order Tracking */}
            {selectedOrder.trackings && selectedOrder.trackings.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Lịch sử theo dõi</h3>
                <div className="space-y-3">
                  {selectedOrder.trackings.map((tracking, index) => (
                    <div
                      key={tracking.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {selectedOrder.trackings.length - index}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ORDER_STATUS_COLORS[tracking.status]
                            }`}
                          >
                            {ORDER_STATUS_LABELS[tracking.status]}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(tracking.createdAt)}
                          </span>
                        </div>
                        {tracking.description && (
                          <p className="mt-1 text-sm text-gray-700">{tracking.description}</p>
                        )}
                        {tracking.location && (
                          <p className="mt-1 text-xs text-gray-500">📍 {tracking.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleUpdateStatus(selectedOrder);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Cập nhật trạng thái
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Cập nhật trạng thái đơn hàng"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái mới *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={statusDescription}
              onChange={(e) => setStatusDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Mô tả chi tiết về cập nhật..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vị trí</label>
            <input
              type="text"
              value={statusLocation}
              onChange={(e) => setStatusLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Vị trí hiện tại của đơn hàng..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => setShowStatusModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitStatus}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};