package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.response.StatisticsResponse;
import com.tmdt.BEphonestore.enums.OrderStatus;
import com.tmdt.BEphonestore.enums.ProductStatus;
import com.tmdt.BEphonestore.enums.UserRole;
import com.tmdt.BEphonestore.repository.OrderRepository;
import com.tmdt.BEphonestore.repository.ProductRepository;
import com.tmdt.BEphonestore.repository.UserRepository;
import com.tmdt.BEphonestore.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

/**
 * Statistics Service Implementation
 */
@Service
public class StatisticsServiceImpl implements StatisticsService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public StatisticsResponse getDashboardStatistics() {
        // Total revenue (COMPLETED orders only)
        BigDecimal totalRevenue = orderRepository.sumTotalPriceByStatus(OrderStatus.COMPLETED);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Total orders
        Long totalOrders = orderRepository.count();

        // Total customers
        Long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);

        // Total products
        Long totalProducts = productRepository.countByStatus(ProductStatus.ACTIVE);

        // Orders by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            Long count = orderRepository.countByStatus(status);
            ordersByStatus.put(status.name(), count);
        }

        // Revenue by month (last 12 months)
        Map<String, BigDecimal> revenueByMonth = new HashMap<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 11; i >= 0; i--) {
            LocalDate month = now.minusMonths(i);
            LocalDateTime startOfMonth = month.withDayOfMonth(1).atStartOfDay();
            LocalDateTime endOfMonth = month.withDayOfMonth(month.lengthOfMonth()).atTime(LocalTime.MAX);

            BigDecimal revenue = orderRepository.sumRevenueByDateRange(
                    OrderStatus.COMPLETED, startOfMonth, endOfMonth);

            if (revenue == null) {
                revenue = BigDecimal.ZERO;
            }

            revenueByMonth.put(month.format(formatter), revenue);
        }

        return StatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .ordersByStatus(ordersByStatus)
                .revenueByMonth(revenueByMonth)
                .build();
    }

    @Override
    public StatisticsResponse getRevenueStatistics(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Revenue in date range
        BigDecimal totalRevenue = orderRepository.sumRevenueByDateRange(
                OrderStatus.COMPLETED, startDateTime, endDateTime);

        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        // Order count in date range
        Long totalOrders = orderRepository.countOrdersByDateRange(startDateTime, endDateTime);

        return StatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .build();
    }
}