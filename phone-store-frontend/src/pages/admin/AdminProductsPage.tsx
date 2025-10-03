import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Product, ProductRequest, Category, PageResponse } from '@/types';
import { productApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import { DataTable } from '@/components/admin/DataTable';
import { SearchBar } from '@/components/admin/SearchBar';
import { Modal } from '@/components/admin/Modal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Pagination } from '@/components/common/Pagination';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<PageResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: 0,
    imageUrl: '',
    specifications: '',
    status: 'ACTIVE',
  });
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, debouncedSearch]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data;
      if (debouncedSearch) {
        data = await productApi.search(debouncedSearch, currentPage, 10);
      } else {
        data = await productApi.getAll(currentPage, 10);
      }
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || '',
        specifications: product.specifications || '',
        status: product.status,
      });
    } else {
      setEditingProduct(null);
      setSelectedFile(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: categories[0]?.id || 0,
        imageUrl: '',
        specifications: '',
        status: 'ACTIVE',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedFile(null);
  };

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleImageRemove = () => {
    setSelectedFile(null);
    setFormData({ ...formData, imageUrl: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData, selectedFile || undefined);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productApi.create(formData, selectedFile || undefined);
        toast.success('Tạo sản phẩm thành công');
      }

      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Không thể lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    try {
      await productApi.delete(product.id);
      toast.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleUpdateStock = async (product: Product) => {
    const newStock = prompt(`Nhập số lượng tồn kho mới cho "${product.name}":`, product.stock.toString());
    
    if (newStock === null) return;
    
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) {
      toast.error('Số lượng không hợp lệ');
      return;
    }

    try {
      await productApi.updateStock(product.id, stock);
      toast.success('Cập nhật tồn kho thành công');
      fetchProducts();
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Không thể cập nhật tồn kho');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'imageUrl',
      label: 'Hình ảnh',
      render: (value: string) => (
        value ? (
          <img 
            src={value.startsWith('http') ? value : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}${value}`} 
            alt="Product" 
            className="h-16 w-16 object-cover rounded"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-phone.jpg';
            }}
          />
        ) : (
          <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">No img</span>
          </div>
        )
      ),
    },
    { 
      key: 'name', 
      label: 'Tên sản phẩm',
      render: (value: string) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    { key: 'categoryName', label: 'Danh mục' },
    {
      key: 'price',
      label: 'Giá',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'stock',
      label: 'Tồn kho',
      render: (value: number, row: Product) => (
        <button
          onClick={() => handleUpdateStock(row)}
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            value > 10 ? 'bg-green-100 text-green-800' :
            value > 0 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h2>
          <p className="text-gray-600">
            Tổng số: {products?.totalElements || 0} sản phẩm
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
      </div>

      {/* Products Table */}
      <DataTable
        data={products?.content || []}
        columns={columns}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Pagination */}
      {products && products.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={products.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <ImageUpload
            currentImage={formData.imageUrl ? 
              (formData.imageUrl.startsWith('http') ? formData.imageUrl : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}${formData.imageUrl}`) 
              : undefined
            }
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            label="Hình ảnh sản phẩm"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ẩn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VNĐ) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tồn kho *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thông số kỹ thuật
              </label>
              <textarea
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="RAM: 8GB&#10;ROM: 256GB&#10;Chip: Snapdragon 8 Gen 3&#10;..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={saving}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{editingProduct ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};