package com.tmdt.BEphonestore.controller;

import com.tmdt.BEphonestore.dto.request.CategoryRequest;
import com.tmdt.BEphonestore.dto.response.CategoryResponse;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @ModelAttribute CategoryRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryResponse category = categoryService.createCategory(request, image);
        return ResponseEntity.ok(category);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @ModelAttribute CategoryRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        CategoryResponse category = categoryService.updateCategory(id, request, image);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteCategory(@PathVariable Long id) {
        MessageResponse response = categoryService.deleteCategory(id);
        return ResponseEntity.ok(response);
    }
}