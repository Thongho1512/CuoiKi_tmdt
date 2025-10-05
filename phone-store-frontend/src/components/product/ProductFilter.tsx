// src/components/product/ProductFilter.tsx
// ✅ SỬA: Đồng bộ category từ URL

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Category } from '@/types/category.types';
import { categoryApi } from '@/api/categoryApi';
import { SORT_OPTIONS } from '@/utils/constants';

interface ProductFilterProps {
  onFilterChange: (filters: any) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ onFilterChange }) => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('id-DESC');

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ THÊM: Đồng bộ category từ URL khi component mount
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    const [field, direction] = sortBy.split('-');
    onFilterChange({
      categoryId: selectedCategory,
      minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
      maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
      sortBy: field,
      sortDir: direction,
    });
  }, [selectedCategory, priceRange, sortBy]);

  // ✅ SỬA: Handler khi click category
  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Hãng điện thoại</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'hover:bg-gray-100'
            }`}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Khoảng giá</h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Giá từ"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="number"
            placeholder="Giá đến"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Sắp xếp</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setSelectedCategory(null);
          setPriceRange({ min: '', max: '' });
          setSortBy('id-DESC');
        }}
        className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
};