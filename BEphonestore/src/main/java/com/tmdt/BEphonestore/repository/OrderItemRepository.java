package com.tmdt.BEphonestore.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tmdt.BEphonestore.entity.OrderItem;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByProductId(Long productId);

    @Query("SELECT oi.product.id, oi.product.name, oi.product.imageUrl, " +
            "SUM(oi.quantity) as totalSold, SUM(oi.subtotal) as totalRevenue " +
            "FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.status = 'COMPLETED' " +
            "AND o.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY oi.product.id, oi.product.name, oi.product.imageUrl " +
            "ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
