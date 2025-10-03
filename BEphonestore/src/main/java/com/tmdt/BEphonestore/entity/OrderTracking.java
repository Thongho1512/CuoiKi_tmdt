package com.tmdt.BEphonestore.entity;

import com.tmdt.BEphonestore.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * OrderTracking Entity (Theo dõi đơn hàng)
 */
@Entity
@Table(name = "OrderTracking")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orderId")
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private OrderStatus status;

    @Column(length = 500, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(length = 200, columnDefinition = "NVARCHAR(MAX)")
    private String location;

    @Column(length = 100, columnDefinition = "NVARCHAR(MAX)")
    private String updatedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}