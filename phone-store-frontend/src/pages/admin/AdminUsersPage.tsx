import React, { useEffect, useState } from 'react';
import { User, PageResponse } from '@/types';
import { userApi } from '@/api/userApi';
import { DataTable } from '@/components/admin/DataTable';
import { SearchBar } from '@/components/admin/SearchBar';
import { Modal } from '@/components/admin/Modal';
import { Pagination } from '@/components/common/Pagination';
import { formatDateTime } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';
import axiosInstance from '@/api/axiosConfig';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<PageResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data;
      if (debouncedSearch) {
        data = await axiosInstance.get('/admin/users/search', {
          params: { keyword: debouncedSearch, page: currentPage, size: 10 },
        });
      } else {
        data = await axiosInstance.get('/admin/users', {
          params: { page: currentPage, size: 10 },
        });
      }
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    if (!confirm(`Bạn có chắc muốn ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa'} tài khoản này?`)) {
      return;
    }

    try {
      await axiosInstance.put(`/admin/users/${user.id}/status`, null, {
        params: { status: newStatus },
      });
      toast.success(`${newStatus === 'ACTIVE' ? 'Kích hoạt' : 'Khóa'} tài khoản thành công`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.username}"?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/users/${user.id}`);
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Không thể xóa người dùng');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Tên đăng nhập' },
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Họ và tên' },
    { 
      key: 'role', 
      label: 'Vai trò',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
    },
    { 
      key: 'status', 
      label: 'Trạng thái',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (value: string) => formatDateTime(value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h2>
          <p className="text-gray-600">
            Tổng số: {users?.totalElements || 0} người dùng
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm theo tên, email..."
          />
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users?.content || []}
        columns={columns}
        onView={handleViewUser}
        onEdit={(user) => handleToggleStatus(user)}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      {/* Pagination */}
      {users && users.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={users.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Chi tiết người dùng"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="mt-1 text-gray-900">{selectedUser.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                <p className="mt-1 text-gray-900">{selectedUser.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <p className="mt-1 text-gray-900">{selectedUser.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <p className="mt-1 text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                <p className="mt-1 text-gray-900">{selectedUser.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <p className="mt-1 text-gray-900">{selectedUser.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                <p className="mt-1 text-gray-900">{formatDateTime(selectedUser.createdAt)}</p>
              </div>
            </div>
            {selectedUser.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <p className="mt-1 text-gray-900">{selectedUser.address}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => handleToggleStatus(selectedUser)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedUser.status === 'ACTIVE'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {selectedUser.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
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
    </div>
  );
};