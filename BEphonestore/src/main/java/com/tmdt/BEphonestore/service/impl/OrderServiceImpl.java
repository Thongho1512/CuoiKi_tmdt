package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.dto.request.OrderRequest;
import com.tmdt.BEphonestore.dto.request.UpdateOrderStatusRequest;
import com.tmdt.BEphonestore.dto.response.*;
import com.tmdt.BEphonestore.entity.*;
import com.tmdt.BEphonestore.enums.OrderStatus;
import com.tmdt.BEphonestore.enums.PaymentMethod;
import com.tmdt.BEphonestore.enums.PaymentStatus;
import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.exception.ResourceNotFoundException;
import com.tmdt.BEphonestore.repository.*;
import com.tmdt.BEphonestore.service.EmailService;
import com.tmdt.BEphonestore.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private OrderTrackingRepository orderTrackingRepository;
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", userDetails.getUsername()));
    }

    private String generateOrderCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Long count = orderRepository.count() + 1;
        return String.format("ORD%s%03d", date, count);
    }

    @Override
    @Transactional
    public OrderDetailResponse createOrder(OrderRequest request) {
        User user = getCurrentUser();

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (!product.getStatus().name().equals("ACTIVE")) {
                throw new BadRequestException("Product " + product.getName() + " is not available");
            }
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + product.getName());
            }
            totalPrice = totalPrice.add(product.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        PaymentStatus paymentStatus = request.getPaymentMethod() == PaymentMethod.COD
                ? PaymentStatus.UNPAID
                : PaymentStatus.PAID;
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .user(user)
                .totalPrice(totalPrice)
                .status(OrderStatus.CONFIRMED)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(paymentStatus)
                .shippingAddress(request.getShippingAddress())
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .note(request.getNote())
                .build();
        Order savedOrder = orderRepository.save(order);

        // Tạo OrderItem + trừ tồn kho
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .productName(product.getName())
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .subtotal(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            orderItemRepository.save(orderItem);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Tracking ban đầu
        OrderTracking tracking = OrderTracking.builder()
                .order(savedOrder)
                .status(OrderStatus.CONFIRMED)
                .description("Đơn hàng đã được xác nhận và đang được xử lý")
                .location("Hệ thống")
                .updatedBy("SYSTEM")
                .build();
        orderTrackingRepository.save(tracking);

        cartItemRepository.deleteByCartId(cart.getId());
        emailService.sendOrderConfirmationEmail(user.getEmail(), savedOrder);

        return mapToOrderDetailResponse(savedOrder);
    }

    @Override
    public Page<OrderResponse> getMyOrders(Pageable pageable) {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId(), pageable).map(this::mapToOrderResponse);
    }

    @Override
    public Page<OrderResponse> getMyOrdersByStatus(OrderStatus status, Pageable pageable) {
        User user = getCurrentUser();
        return orderRepository.findByUserIdAndStatus(user.getId(), status, pageable).map(this::mapToOrderResponse);
    }

    @Override
    public OrderDetailResponse getOrderById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Order does not belong to you");
        }
        return mapToOrderDetailResponse(order);
    }

    @Override
    public OrderDetailResponse getOrderByCode(String orderCode) {
        User user = getCurrentUser();
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderCode", orderCode));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Order does not belong to you");
        }
        return mapToOrderDetailResponse(order);
    }

    @Override
    @Transactional
    public MessageResponse cancelOrder(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Order does not belong to you");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Can only cancel pending orders");
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        for (OrderItem item : orderItems) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        OrderTracking tracking = OrderTracking.builder()
                .order(order)
                .status(OrderStatus.CANCELLED)
                .description("Đơn hàng đã được hủy bởi khách hàng")
                .location("Hệ thống")
                .updatedBy(user.getUsername())
                .build();
        orderTrackingRepository.save(tracking);

        emailService.sendOrderStatusUpdateEmail(user.getEmail(), order);
        return new MessageResponse("Order cancelled successfully");
    }

    // ===== ADMIN =====
    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::mapToOrderResponse);
    }

    @Override
    public Page<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable).map(this::mapToOrderResponse);
    }

    @Override
    public Page<OrderResponse> searchOrders(String keyword, Pageable pageable) {
        return orderRepository.searchOrders(keyword, pageable).map(this::mapToOrderResponse);
    }

    @Override
    @Transactional
    public MessageResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        User admin = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        validateStatusTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());

        if (request.getStatus() == OrderStatus.COMPLETED &&
                order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
        }
        orderRepository.save(order);

        OrderTracking tracking = OrderTracking.builder()
                .order(order)
                .status(request.getStatus())
                .description(request.getDescription() != null ? request.getDescription()
                        : getDefaultStatusDescription(request.getStatus()))
                .location(request.getLocation())
                .updatedBy(admin.getUsername())
                .build();
        orderTrackingRepository.save(tracking);

        emailService.sendOrderStatusUpdateEmail(order.getUser().getEmail(), order);
        return new MessageResponse("Order status updated successfully");
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot change status of " + current);
        }
        boolean valid = switch (current) {
            case PENDING -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.SHIPPING || next == OrderStatus.CANCELLED;
            case SHIPPING -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            case DELIVERED -> next == OrderStatus.COMPLETED;
            default -> false;
        };
        if (!valid)
            throw new BadRequestException("Invalid transition " + current + " -> " + next);
    }

    private String getDefaultStatusDescription(OrderStatus status) {
        return switch (status) {
            case CONFIRMED -> "Đơn hàng đã được xác nhận";
            case PROCESSING -> "Đơn hàng đang được chuẩn bị";
            case SHIPPING -> "Đơn hàng đang được giao";
            case DELIVERED -> "Đơn hàng đã được giao thành công";
            case COMPLETED -> "Đơn hàng đã hoàn thành";
            case CANCELLED -> "Đơn hàng đã bị hủy";
            default -> "Cập nhật trạng thái đơn hàng";
        };
    }

    private OrderResponse mapToOrderResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .note(order.getNote())
                .paypalOrderId(order.getPaypalOrderId())
                .paidAt(order.getPaidAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderDetailResponse mapToOrderDetailResponse(Order order) {
        List<OrderItemResponse> itemResponses = orderItemRepository.findByOrderId(order.getId())
                .stream().map(this::mapToOrderItemResponse).collect(Collectors.toList());
        List<OrderTrackingResponse> trackingResponses = orderTrackingRepository
                .findByOrderIdOrderByCreatedAtAsc(order.getId())
                .stream().map(this::mapToOrderTrackingResponse).collect(Collectors.toList());

        return OrderDetailResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .userEmail(order.getUser().getEmail())
                .userPhone(order.getUser().getPhone())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddress(order.getShippingAddress())
                .recipientName(order.getRecipientName())
                .recipientPhone(order.getRecipientPhone())
                .note(order.getNote())
                .paypalOrderId(order.getPaypalOrderId())
                .paidAt(order.getPaidAt())
                .items(itemResponses)
                .trackings(trackingResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private OrderTrackingResponse mapToOrderTrackingResponse(OrderTracking tracking) {
        return OrderTrackingResponse.builder()
                .id(tracking.getId())
                .orderId(tracking.getOrder().getId())
                .status(tracking.getStatus())
                .description(tracking.getDescription())
                .location(tracking.getLocation())
                .updatedBy(tracking.getUpdatedBy())
                .createdAt(tracking.getCreatedAt())
                .build();
    }
}
