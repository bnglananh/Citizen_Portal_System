package com.citizenportal.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDto {
    private long totalApplications;
    private long draftCount;
    private long submittedCount;
    private long receivedCount;
    private long processingCount;
    private long needRevisionCount;
    private long resubmittedCount;
    private long completedCount;
    private long rejectedCount;

    // Macro Metrics for Admin Dashboard
    private Long totalUsers;
    private Long totalProcedures;
    private Double avgProcessingTimeDays;
    private Double onTimeRate;
    private Map<String, Long> statusDistribution;
    private java.util.List<MonthlyTrendDto> monthlyTrends;
    private java.util.List<CategoryVolumeDto> categoryVolumes;
}
