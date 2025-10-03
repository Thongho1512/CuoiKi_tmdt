package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.entity.Order;

public interface EmailService {
    void sendOrderConfirmationEmail(String to, Order order);

    void sendOrderStatusUpdateEmail(String to, Order order);
}
