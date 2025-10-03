package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.entity.Order;
import com.tmdt.BEphonestore.entity.OrderItem;
import com.tmdt.BEphonestore.repository.OrderItemRepository;
import com.tmdt.BEphonestore.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Email Service Implementation
 */
@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private SpringTemplateEngine templateEngine;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public void sendOrderConfirmationEmail(String to, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("Xác nhận đơn hàng #" + order.getOrderCode());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("orderItems", orderItemRepository.findByOrderId(order.getId()));
            context.setVariable("baseUrl", baseUrl);
            context.setVariable("formatPrice", new NumberFormat() {
                @Override
                public StringBuffer format(double number, StringBuffer toAppendTo, java.text.FieldPosition pos) {
                    return toAppendTo.append(NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(number));
                }

                @Override
                public StringBuffer format(long number, StringBuffer toAppendTo, java.text.FieldPosition pos) {
                    return toAppendTo.append(NumberFormat.getCurrencyInstance(new Locale("vi", "VN")).format(number));
                }

                @Override
                public Number parse(String source, java.text.ParsePosition parsePosition) {
                    return null;
                }
            });

            String htmlContent = templateEngine.process("order-confirmation", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending order confirmation email: " + e.getMessage());
        }
    }

    @Override
    public void sendOrderStatusUpdateEmail(String to, Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject("Cập nhật đơn hàng #" + order.getOrderCode());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("baseUrl", baseUrl);

            String htmlContent = templateEngine.process("order-status-update", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending order status update email: " + e.getMessage());
        }
    }
}
