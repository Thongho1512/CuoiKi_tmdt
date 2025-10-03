package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.request.OrderRequest;
import com.tmdt.BEphonestore.dto.request.UpdateOrderStatusRequest;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.dto.response.OrderDetailResponse;
import com.tmdt.BEphonestore.dto.response.OrderResponse;
import com.tmdt.BEphonestore.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    OrderDetailResponse createOrder(OrderRequest request);

    Page<OrderResponse> getMyOrders(Pageable pageable);

    Page<OrderResponse> getMyOrdersByStatus(OrderStatus status, Pageable pageable);

    OrderDetailResponse getOrderById(Long id);

    OrderDetailResponse getOrderByCode(String orderCode);

    MessageResponse cancelOrder(Long id);

    // Admin methods
    Page<OrderResponse> getAllOrders(Pageable pageable);

    Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable);

    Page<OrderResponse> searchOrders(String keyword, Pageable pageable);

    MessageResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);
}
