package com.tmdt.BEphonestore.dto.request;

import com.tmdt.BEphonestore.enums.ProductStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Product Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 200)
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock must be at least 0")
    private Integer stock;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Size(max = 500)
    private String imageUrl;

    private String specifications;

    private ProductStatus status;
}
