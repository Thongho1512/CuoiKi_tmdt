package com.tmdt.BEphonestore.service;

import com.tmdt.BEphonestore.dto.response.StatisticsResponse;

import java.time.LocalDate;

public interface StatisticsService {
    StatisticsResponse getDashboardStatistics();

    StatisticsResponse getRevenueStatistics(LocalDate startDate, LocalDate endDate);
}