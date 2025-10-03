package com.tmdt.BEphonestore.service;

import com.paypal.api.payments.Payment;
import com.tmdt.BEphonestore.dto.response.PayPalOrderResponse;

public interface PayPalService {
    PayPalOrderResponse createPayment(Double total, String currency, String method, 
                                     String intent, String description, 
                                     String cancelUrl, String successUrl);
    Payment executePayment(String paymentId, String payerId);
}