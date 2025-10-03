package com.tmdt.BEphonestore.dto.request;

import com.tmdt.BEphonestore.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Order Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 500)
    private String shippingAddress;

    @NotBlank(message = "Recipient name is required")
    @Size(max = 100)
    private String recipientName;

    @NotBlank(message = "Recipient phone is required")
    @Size(max = 20)
    private String recipientPhone;

    @Size(max = 500)
    private String note;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
