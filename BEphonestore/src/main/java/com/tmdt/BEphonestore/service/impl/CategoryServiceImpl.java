package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.request.CategoryRequest;
import com.tmdt.BEphonestore.dto.response.CategoryResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.entity.Category;
import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.exception.ResourceNotFoundException;
import com.tmdt.BEphonestore.repository.CategoryRepository;
import com.tmdt.BEphonestore.service.CategoryService;
import com.tmdt.BEphonestore.service.FileStorageService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

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
    public CategoryResponse createCategory(CategoryRequest request, MultipartFile image) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        // Upload image if provided
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeFile(image);
            imageUrl = "/uploads/" + fileName;
        } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            imageUrl = request.getImageUrl();
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .imageUrl(imageUrl)
                .build();

        Category savedCategory = categoryRepository.save(category);

        CategoryResponse response = modelMapper.map(savedCategory, CategoryResponse.class);
        response.setProductCount(0);
        return response;
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, MultipartFile image) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (category.getImageUrl() != null && !category.getImageUrl().isEmpty() &&
                    category.getImageUrl().startsWith("/uploads/")) {
                String oldFileName = category.getImageUrl().replace("/uploads/", "");
                fileStorageService.deleteFile(oldFileName);
            }

            // Upload new image
            String fileName = fileStorageService.storeFile(image);
            category.setImageUrl("/uploads/" + fileName);
        } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
            category.setImageUrl(request.getImageUrl());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

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

        if (!category.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete category with existing products");
        }

        // Delete image if exists
        if (category.getImageUrl() != null && !category.getImageUrl().isEmpty() &&
                category.getImageUrl().startsWith("/uploads/")) {
            String fileName = category.getImageUrl().replace("/uploads/", "");
            fileStorageService.deleteFile(fileName);
        }

        categoryRepository.delete(category);
        return new MessageResponse("Category deleted successfully");
    }
}