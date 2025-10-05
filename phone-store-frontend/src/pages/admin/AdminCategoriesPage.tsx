// src/pages/admin/AdminCategoriesPage.tsx
// ✅ THÊM: Component riêng cho category image

import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Category, CategoryRequest } from '@/types';
import { categoryApi } from '@/api/categoryApi';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/admin/Modal';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { formatDateTime } from '@/utils/formatters';
import { getCategoryImageUrl } from '@/utils/imageHelper'; // ✅ THÊM import
import toast from 'react-hot-toast';

// ✅ THÊM: Component cho category image cell
const CategoryImageCell: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const [error, setError] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  const handleError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!error) {
      setError(true);
      e.currentTarget.src = '/placeholder-category.jpg';
    }
  }, [error]);

  const src = error ? '/placeholder-category.jpg' : getCategoryImageUrl(imageUrl);

  return imageUrl ? (
    <div className="relative h-12 w-12">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 rounded animate-pulse" />
      )}
      <img
        src={src}
        alt="Category"
        className={`h-12 w-12 object-cover rounded transition-opacity duration-200 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleError}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  ) : (
    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
      <span className="text-xs text-gray-500">No img</span>
    </div>
  );
};

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CategoryRequest>({
    name: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        imageUrl: category.imageUrl || '',
      });
    } else {
      setEditingCategory(null);
      setSelectedFile(null);
      setFormData({ name: '', description: '', imageUrl: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
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
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, formData, selectedFile || undefined);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryApi.create(formData, selectedFile || undefined);
        toast.success('Tạo danh mục thành công');
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    try {
      await categoryApi.delete(category.id);
      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      if (error.response?.data?.message?.includes('products')) {
        toast.error('Không thể xóa danh mục có sản phẩm');
      } else {
        toast.error('Không thể xóa danh mục');
      }
    }
  };

  // ✅ SỬA: columns với component riêng cho image
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'imageUrl',
      label: 'Hình ảnh',
      render: (value: string) => <CategoryImageCell imageUrl={value} />,
    },
    { key: 'name', label: 'Tên danh mục' },
    { key: 'description', label: 'Mô tả' },
    {
      key: 'productCount',
      label: 'Số sản phẩm',
      render: (value: number) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {value || 0}
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
          <h2 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h2>
          <p className="text-gray-600">Tổng số: {categories.length} danh mục</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Categories Table */}
      <DataTable
        data={categories}
        columns={columns}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <ImageUpload
            currentImage={formData.imageUrl ? getCategoryImageUrl(formData.imageUrl) : undefined}
            onImageSelect={handleImageSelect}
            onImageRemove={handleImageRemove}
            label="Logo danh mục"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên danh mục *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nhập tên danh mục"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Nhập mô tả danh mục"
            />
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
                <span>{editingCategory ? 'Cập nhật' : 'Tạo mới'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};