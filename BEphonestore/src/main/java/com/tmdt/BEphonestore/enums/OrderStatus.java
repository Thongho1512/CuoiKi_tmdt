package com.tmdt.BEphonestore.enums;

/**
 * Order Status Enum
 */
public enum OrderStatus {
    PENDING,      // Chờ xác nhận
    CONFIRMED,    // Đã xác nhận
    PROCESSING,   // Đang chuẩn bị hàng
    SHIPPING,     // Đang giao hàng
    DELIVERED,    // Đã giao hàng
    COMPLETED,    // Hoàn thành
    CANCELLED     // Đã hủy
}