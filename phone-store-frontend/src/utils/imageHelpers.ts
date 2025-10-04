/**
 * Get full image URL from relative or absolute path
 */
export const getImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return '/placeholder-phone.jpg';
  }

  // If already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Get base URL from env (includes /api)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  // For /uploads path, we need to go to server root (remove /api)
  // Because uploads are served from server root, not from /api
  if (imageUrl.startsWith('/uploads')) {
    const serverUrl = apiBaseUrl.replace('/api', '');
    return `${serverUrl}${imageUrl}`;
  }
  
  // For other paths, keep /api
  return `${apiBaseUrl}${imageUrl}`;
};

/**
 * Get category image URL with fallback
 */
export const getCategoryImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return '/placeholder-category.jpg';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Get base URL from env (includes /api)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  // For /uploads path, we need to go to server root (remove /api)
  if (imageUrl.startsWith('/uploads')) {
    const serverUrl = apiBaseUrl.replace('/api', '');
    return `${serverUrl}${imageUrl}`;
  }
  
  // For other paths, keep /api
  return `${apiBaseUrl}${imageUrl}`;
};