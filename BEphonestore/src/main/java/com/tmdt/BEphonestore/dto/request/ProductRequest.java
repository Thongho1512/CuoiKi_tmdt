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

    @Size(max = 200)
    private String name;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @Min(value = 0, message = "Stock must be at least 0")
    private Integer stock;

    private Long categoryId;

    private String specifications;

    private ProductStatus status;
}
