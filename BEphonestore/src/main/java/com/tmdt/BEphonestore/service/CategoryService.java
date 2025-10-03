package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.CategoryRequest;
import com.tmdt.BEphonestore.dto.response.CategoryResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CategoryRequest request, MultipartFile image);

    CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile image);

    MessageResponse deleteCategory(Long id);
}