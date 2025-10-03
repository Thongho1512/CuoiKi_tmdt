package com.tmdt.BEphonestore.controller;

import com.tmdt.BEphonestore.dto.response.StatisticsResponse;
import com.tmdt.BEphonestore.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Statistics Controller
 */
@RestController
@RequestMapping("/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/dashboard")
    public ResponseEntity<StatisticsResponse> getDashboardStatistics() {
        StatisticsResponse statistics = statisticsService.getDashboardStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/revenue")
    public ResponseEntity<StatisticsResponse> getRevenueStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        StatisticsResponse statistics = statisticsService.getRevenueStatistics(startDate, endDate);
        return ResponseEntity.ok(statistics);
    }
}