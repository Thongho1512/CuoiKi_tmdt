package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.request.ProductRequest;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.dto.response.ProductResponse;
import com.tmdt.BEphonestore.entity.Category;
import com.tmdt.BEphonestore.entity.Product;
import com.tmdt.BEphonestore.enums.ProductStatus;
import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.exception.ResourceNotFoundException;
import com.tmdt.BEphonestore.repository.CategoryRepository;
import com.tmdt.BEphonestore.repository.ProductRepository;
import com.tmdt.BEphonestore.service.FileStorageService;
import com.tmdt.BEphonestore.service.ProductService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final ModelMapper modelMapper;

    public ProductServiceImpl(ProductRepository productRepository,
            CategoryRepository categoryRepository,
            FileStorageService fileStorageService,
            ModelMapper modelMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
        this.modelMapper = modelMapper;
    }

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
        return productRepository.findByStatus(ProductStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);
        return mapToResponse(product);
    }

    @Override
    public Page<ProductResponse> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProductsByStatus(keyword, ProductStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(Long categoryId, Pageable pageable) {
        categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByPriceBetweenAndStatus(minPrice, maxPrice, ProductStatus.ACTIVE, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, MultipartFile image) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Upload image if provided
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            String fileName = fileStorageService.storeFile(image);
            imageUrl = "/uploads/" + fileName;
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .imageUrl(imageUrl)
                .specifications(request.getSpecifications())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .build();

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, MultipartFile image) {
        Product product = findProductById(id);

        if (request.getCategoryId() != null &&
                !request.getCategoryId().equals(product.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        // Handle image upload
        if (image != null && !image.isEmpty()) {
            // Delete old image if exists
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty() &&
                    product.getImageUrl().startsWith("/uploads/")) {
                String oldFileName = product.getImageUrl().replace("/uploads/", "");
                fileStorageService.deleteFile(oldFileName);
            }

            // Upload new image
            String fileName = fileStorageService.storeFile(image);
            product.setImageUrl("/uploads/" + fileName);
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setSpecifications(request.getSpecifications());

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        return mapToResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public MessageResponse deleteProduct(Long id) {
        Product product = findProductById(id);

        // Delete image if exists
        if (product.getImageUrl() != null && !product.getImageUrl().isEmpty() &&
                product.getImageUrl().startsWith("/uploads/")) {
            String fileName = product.getImageUrl().replace("/uploads/", "");
            fileStorageService.deleteFile(fileName);
        }

        productRepository.delete(product);
        return new MessageResponse("Product deleted successfully");
    }

    @Override
    @Transactional
    public MessageResponse updateStock(Long id, Integer stock) {
        Product product = findProductById(id);

        if (stock < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }

        product.setStock(stock);
        productRepository.save(product);

        return new MessageResponse("Stock updated successfully");
    }

    private Product findProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse mapToResponse(Product product) {
        ProductResponse response = modelMapper.map(product, ProductResponse.class);
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        return response;
    }
}