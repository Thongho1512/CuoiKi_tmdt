// src/utils/imageHelper.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Convert image URL to full URL if needed
 * @param imageUrl - The image URL from API (can be relative or absolute)
 * @returns Full URL for the image
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/placeholder-phone.jpg';
  }
  
  // If already a full URL (starts with http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, prepend API base URL
  return `${API_BASE_URL}${imageUrl}`;
};

/**
 * Get category image URL with proper fallback
 * @param imageUrl - The category image URL from API
 * @returns Full URL for the category image
 */
export const getCategoryImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) {
    return '/placeholder-category.jpg';
  }
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative URL, prepend API base URL
  return `${API_BASE_URL}${imageUrl}`;
};

/**
 * Get product image URL with proper fallback
 * @param imageUrl - The product image URL from API
 * @returns Full URL for the product image
 */
export const getProductImageUrl = (imageUrl: string | null | undefined): string => {
  return getImageUrl(imageUrl);
};