package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.request.CategoryRequest;
import com.tmdt.BEphonestore.dto.response.CategoryResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.entity.Category;
import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.exception.ResourceNotFoundException;
import com.tmdt.BEphonestore.repository.CategoryRepository;
import com.tmdt.BEphonestore.service.CategoryService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Category Service Implementation
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(category -> {
                    CategoryResponse response = modelMapper.map(category, CategoryResponse.class);
                    response.setProductCount(category.getProducts().size());
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        CategoryResponse response = modelMapper.map(category, CategoryResponse.class);
        response.setProductCount(category.getProducts().size());
        return response;
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // Check if category name already exists
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Category savedCategory = categoryRepository.save(category);

        CategoryResponse response = modelMapper.map(savedCategory, CategoryResponse.class);
        response.setProductCount(0);
        return response;
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check if new name already exists (excluding current category)
        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        Category updatedCategory = categoryRepository.save(category);

        CategoryResponse response = modelMapper.map(updatedCategory, CategoryResponse.class);
        response.setProductCount(updatedCategory.getProducts().size());
        return response;
    }

    @Override
    @Transactional
    public MessageResponse deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        // Check if category has products
        if (!category.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing products");
        }

        categoryRepository.delete(category);
        return new MessageResponse("Category deleted successfully");
    }
}
