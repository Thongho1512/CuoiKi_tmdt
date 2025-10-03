package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.ProductRequest;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

public interface ProductService {
    Page<ProductResponse> getAllProducts(Pageable pageable);

    Page<ProductResponse> getActiveProducts(Pageable pageable);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> searchProducts(String keyword, Pageable pageable);

    Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable);

    Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    ProductResponse createProduct(ProductRequest request, MultipartFile image);

    ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile image);

    MessageResponse deleteProduct(Long id);

    MessageResponse updateStock(Long id, Integer stock);
}