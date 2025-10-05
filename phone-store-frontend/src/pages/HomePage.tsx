// src/pages/HomePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product, Category } from '@/types';
import { productApi } from '@/api/productApi';
import { categoryApi } from '@/api/categoryApi';
import { getCategoryImageUrl } from '@/utils/imageHelper';
import { ProductCard } from '@/components/product/ProductCard';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ THÊM: State cho category images
  const [categoryImageErrors, setCategoryImageErrors] = useState<Record<number, boolean>>({});
  const [categoryImageLoaded, setCategoryImageLoaded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesData, productsData] = await Promise.all([
        categoryApi.getAll(),
        productApi.getAll(0, 8, 'createdAt', 'DESC'),
      ]);
      setCategories(categoriesData);
      setFeaturedProducts(productsData.content);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ THÊM: Category image handlers
  const handleCategoryImageError = useCallback((categoryId: number) => {
    return (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (!categoryImageErrors[categoryId]) {
        setCategoryImageErrors(prev => ({ ...prev, [categoryId]: true }));
        e.currentTarget.src = '/placeholder-category.jpg';
      }
    };
  }, [categoryImageErrors]);

  const handleCategoryImageLoad = useCallback((categoryId: number) => {
    return () => {
      setCategoryImageLoaded(prev => ({ ...prev, [categoryId]: true }));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">📱 Phone Store</h1>
          <p className="text-xl mb-8">Điện thoại chính hãng, giá tốt nhất thị trường</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories - ✅ SỬA LẠI */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Hãng điện thoại</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const imageUrl = categoryImageErrors[category.id]
                ? '/placeholder-category.jpg'
                : getCategoryImageUrl(category.imageUrl);
              const isLoaded = categoryImageLoaded[category.id];

              return (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gray-200 rounded animate-pulse" />
                    )}
                    <img
                      src={imageUrl}
                      alt={category.name}
                      className={`w-16 h-16 object-contain transition-opacity duration-300 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onError={handleCategoryImageError(category.id)}
                      onLoad={handleCategoryImageLoad(category.id)}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Sản phẩm mới nhất</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};