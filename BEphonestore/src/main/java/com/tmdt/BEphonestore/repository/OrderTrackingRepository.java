package com.tmdt.BEphonestore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tmdt.BEphonestore.entity.OrderTracking;
import com.tmdt.BEphonestore.enums.OrderStatus;

import java.util.List;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {

    List<OrderTracking> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    List<OrderTracking> findByOrderIdOrderByCreatedAtDesc(Long orderId);

    List<OrderTracking> findByStatus(OrderStatus status);
}