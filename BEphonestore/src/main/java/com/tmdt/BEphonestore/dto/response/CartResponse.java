package com.tmdt.BEphonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO trả về thông tin giỏ hàng
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id; // ID giỏ hàng
    private Long userId; // ID người dùng
    private List<CartItemResponse> items; // Danh sách sản phẩm trong giỏ
    private Integer totalItems; // Tổng số lượng sản phẩm
    private BigDecimal totalAmount; // Tổng tiền
}
