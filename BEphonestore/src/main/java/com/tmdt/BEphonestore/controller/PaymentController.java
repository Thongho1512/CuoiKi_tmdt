package com.tmdt.BEphonestore.controller;

import com.paypal.api.payments.Payment;
import com.tmdt.BEphonestore.dto.request.PayPalPaymentRequest;
import com.tmdt.BEphonestore.dto.response.MessageResponse;
import com.tmdt.BEphonestore.dto.response.PayPalOrderResponse;
import com.tmdt.BEphonestore.entity.Order;
import com.tmdt.BEphonestore.enums.PaymentStatus;
import com.tmdt.BEphonestore.repository.OrderRepository;
import com.tmdt.BEphonestore.service.PayPalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Payment Controller
 */
@RestController
@RequestMapping("/payment")
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class PaymentController {

    @Autowired
    private PayPalService paypalService;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    @PostMapping("/paypal/create-order")
    public ResponseEntity<PayPalOrderResponse> createPayPalOrder(@RequestBody PayPalPaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String cancelUrl = baseUrl + "/payment/cancel";
        String successUrl = baseUrl + "/payment/success?orderId=" + order.getId();

        PayPalOrderResponse response = paypalService.createPayment(
                order.getTotalPrice().doubleValue(),
                "USD",
                "paypal",
                "sale",
                "Order #" + order.getOrderCode(),
                cancelUrl,
                successUrl);

        // Save PayPal order ID
        order.setPaypalOrderId(response.getOrderId());
        orderRepository.save(order);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/paypal/capture-order")
    public ResponseEntity<MessageResponse> capturePayPalOrder(
            @RequestParam String paymentId,
            @RequestParam String payerId,
            @RequestParam Long orderId) {

        Payment payment = paypalService.executePayment(paymentId, payerId);

        if (payment.getState().equals("approved")) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            order.setPaymentStatus(PaymentStatus.PAID);
            order.setPaidAt(LocalDateTime.now());
            orderRepository.save(order);

            return ResponseEntity.ok(new MessageResponse("Payment successful"));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Payment failed"));
    }
}
