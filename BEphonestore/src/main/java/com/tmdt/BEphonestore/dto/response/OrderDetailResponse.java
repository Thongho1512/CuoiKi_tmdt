package com.tmdt.BEphonestore.dto.response;

import com.tmdt.BEphonestore.enums.OrderStatus;
import com.tmdt.BEphonestore.enums.PaymentMethod;
import com.tmdt.BEphonestore.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {
    private Long id;
    private String orderCode;
    private Long userId;
    private String username;
    private String userEmail;
    private String userPhone;
    private BigDecimal totalPrice;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String shippingAddress;
    private String recipientName;
    private String recipientPhone;
    private String note;
    private String paypalOrderId;
    private LocalDateTime paidAt;
    private List<OrderItemResponse> items;
    private List<OrderTrackingResponse> trackings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
