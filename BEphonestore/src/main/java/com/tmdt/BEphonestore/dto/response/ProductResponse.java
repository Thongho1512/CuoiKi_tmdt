package com.tmdt.BEphonestore.dto.response;

import com.tmdt.BEphonestore.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO trả về thông tin Product
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String specifications;
    private ProductStatus status;

    private Long categoryId; // thêm để dễ hiển thị
    private String categoryName; // tên hãng/category

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
