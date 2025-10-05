// src/pages/ProductsPage.tsx
// ✅ SỬA: Logic lọc theo category và filters

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, PageResponse } from '@/types';
import { productApi } from '@/api/productApi';
import { ProductList } from '@/components/product/ProductList';
import { ProductFilter } from '@/components/product/ProductFilter';
import { Pagination } from '@/components/common/Pagination';
import { useDebounce } from '@/hooks/useDebounce';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<PageResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(0);

  const searchQuery = searchParams.get('search');
  const categoryIdParam = searchParams.get('category');
  const debouncedSearch = useDebounce(searchQuery || '', 500);

  // ✅ SỬA: useEffect để sync categoryId từ URL vào filters
  useEffect(() => {
    if (categoryIdParam) {
      setFilters((prev: any) => ({
        ...prev,
        categoryId: parseInt(categoryIdParam),
      }));
    }
  }, [categoryIdParam]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters, debouncedSearch, categoryIdParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let data;
      
      // ✅ SỬA: Ưu tiên search, sau đó category từ URL, cuối cùng là filters
      if (debouncedSearch) {
        data = await productApi.search(debouncedSearch, currentPage, 12);
      } else if (categoryIdParam) {
        // Lọc theo category từ URL (khi click từ HomePage)
        data = await productApi.getByCategory(
          parseInt(categoryIdParam),
          currentPage,
          12,
          filters.sortBy || 'id',
          filters.sortDir || 'DESC'
        );
      } else if (filters.categoryId) {
        // Lọc theo category từ ProductFilter
        data = await productApi.getByCategory(
          filters.categoryId,
          currentPage,
          12,
          filters.sortBy || 'id',
          filters.sortDir || 'DESC'
        );
      } else if (filters.minPrice && filters.maxPrice) {
        // Lọc theo khoảng giá
        data = await productApi.getByPriceRange(
          filters.minPrice,
          filters.maxPrice,
          currentPage,
          12
        );
      } else {
        // Lấy tất cả với sort
        data = await productApi.getAll(
          currentPage,
          12,
          filters.sortBy || 'id',
          filters.sortDir || 'DESC'
        );
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(0);
    
    // ✅ THÊM: Xóa category từ URL khi filter thay đổi
    if (categoryIdParam && newFilters.categoryId !== parseInt(categoryIdParam)) {
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Danh sách sản phẩm</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilter onFilterChange={handleFilterChange} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {products && (
              <div className="mb-4 text-gray-600">
                Tìm thấy {products.totalElements} sản phẩm
              </div>
            )}

            <ProductList products={products?.content || []} loading={loading} />

            {products && products.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={products.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};