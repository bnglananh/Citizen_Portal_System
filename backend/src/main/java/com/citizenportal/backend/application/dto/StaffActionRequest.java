package com.citizenportal.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffActionRequest {

    @NotBlank(message = "Hành động xử lý không được để trống")
    private String action; // RECEIVE, PROCESS, REQUEST_REVISION, REJECT, COMPLETE

    private String comments;

    private String rejectionReason;

    private String revisionNotes;

    private String resultSummary;
}
