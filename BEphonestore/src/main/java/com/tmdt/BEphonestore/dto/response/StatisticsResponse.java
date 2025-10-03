package com.tmdt.BEphonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO thống kê cho Dashboard
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {
    private BigDecimal totalRevenue; // Tổng doanh thu
    private Long totalOrders; // Tổng số đơn hàng
    private Long totalCustomers; // Tổng số khách hàng
    private Long totalProducts; // Tổng số sản phẩm
    private Map<String, Long> ordersByStatus; // Số đơn theo trạng thái
    private Map<String, BigDecimal> revenueByMonth; // Doanh thu theo tháng
}
