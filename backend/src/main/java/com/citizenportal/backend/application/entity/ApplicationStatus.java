package com.citizenportal.backend.application.entity;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum ApplicationStatus {
    DRAFT("Bản nháp"),
    SUBMITTED("Đã nộp"),
    RECEIVED("Đã tiếp nhận"),
    PROCESSING("Đang xử lý"),
    NEED_REVISION("Cần bổ sung"),
    RESUBMITTED("Đã nộp lại"),
    REJECTED("Đã từ chối"),
    COMPLETED("Đã hoàn tất");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    private static final Map<ApplicationStatus, Set<ApplicationStatus>> VALID_TRANSITIONS = Map.of(
            DRAFT, EnumSet.of(SUBMITTED),
            SUBMITTED, EnumSet.of(RECEIVED, REJECTED),
            RECEIVED, EnumSet.of(PROCESSING, NEED_REVISION, REJECTED),
            PROCESSING, EnumSet.of(COMPLETED, NEED_REVISION, REJECTED),
            NEED_REVISION, EnumSet.of(RESUBMITTED),
            RESUBMITTED, EnumSet.of(PROCESSING, NEED_REVISION, REJECTED),
            REJECTED, EnumSet.noneOf(ApplicationStatus.class),
            COMPLETED, EnumSet.noneOf(ApplicationStatus.class)
    );

    public boolean canTransitionTo(ApplicationStatus targetStatus) {
        if (targetStatus == null) return false;
        Set<ApplicationStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(targetStatus);
    }
}
