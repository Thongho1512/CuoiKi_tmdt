
package com.tmdt.BEphonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO trả về thông tin chi tiết sản phẩm trong giỏ hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id; // ID của CartItem
    private Long productId; // ID sản phẩm
    private String productName; // Tên sản phẩm
    private String productImage; // Ảnh sản phẩm
    private BigDecimal productPrice; // Giá sản phẩm
    private Integer quantity; // Số lượng
    private BigDecimal subtotal; // Thành tiền (productPrice * quantity)
}
