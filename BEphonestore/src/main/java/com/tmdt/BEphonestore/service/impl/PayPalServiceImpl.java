package com.tmdt.BEphonestore.service.impl;

import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import com.tmdt.BEphonestore.dto.response.PayPalOrderResponse;
import com.tmdt.BEphonestore.exception.PaymentException;
import com.tmdt.BEphonestore.service.PayPalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * PayPal Service Implementation
 */
@Service
public class PayPalServiceImpl implements PayPalService {

    @Autowired
    private APIContext apiContext;

    @Override
    public PayPalOrderResponse createPayment(Double total, String currency, String method,
            String intent, String description,
            String cancelUrl, String successUrl) {
        try {
            Amount amount = new Amount();
            amount.setCurrency(currency);
            amount.setTotal(String.format("%.2f", total));

            Transaction transaction = new Transaction();
            transaction.setDescription(description);
            transaction.setAmount(amount);

            List<Transaction> transactions = new ArrayList<>();
            transactions.add(transaction);

            Payer payer = new Payer();
            payer.setPaymentMethod(method);

            Payment payment = new Payment();
            payment.setIntent(intent);
            payment.setPayer(payer);
            payment.setTransactions(transactions);

            RedirectUrls redirectUrls = new RedirectUrls();
            redirectUrls.setCancelUrl(cancelUrl);
            redirectUrls.setReturnUrl(successUrl);
            payment.setRedirectUrls(redirectUrls);

            Payment createdPayment = payment.create(apiContext);

            String approvalUrl = null;
            for (Links link : createdPayment.getLinks()) {
                if (link.getRel().equals("approval_url")) {
                    approvalUrl = link.getHref();
                    break;
                }
            }

            return PayPalOrderResponse.builder()
                    .orderId(createdPayment.getId())
                    .status(createdPayment.getState())
                    .approvalUrl(approvalUrl)
                    .build();

        } catch (PayPalRESTException e) {
            throw new PaymentException("Error creating PayPal payment: " + e.getMessage(), e);
        }
    }

    @Override
    public Payment executePayment(String paymentId, String payerId) {
        try {
            Payment payment = new Payment();
            payment.setId(paymentId);

            PaymentExecution paymentExecution = new PaymentExecution();
            paymentExecution.setPayerId(payerId);

            return payment.execute(apiContext, paymentExecution);

        } catch (PayPalRESTException e) {
            throw new PaymentException("Error executing PayPal payment: " + e.getMessage(), e);
        }
    }
}
