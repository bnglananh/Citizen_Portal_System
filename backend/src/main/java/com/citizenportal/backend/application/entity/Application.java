package com.citizenportal.backend.application.entity;

import com.citizenportal.backend.common.entity.BaseEntity;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "applications", indexes = {
        @Index(name = "idx_applications_code", columnList = "application_code", unique = true),
        @Index(name = "idx_applications_citizen", columnList = "citizen_id"),
        @Index(name = "idx_applications_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_code", unique = true, nullable = false, length = 30)
    private String applicationCode; // e.g. HS202600001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.DRAFT;

    @Column(name = "applicant_name", nullable = false, length = 100)
    private String applicantName;

    @Column(name = "applicant_phone", nullable = false, length = 20)
    private String applicantPhone;

    @Column(name = "applicant_email", length = 100)
    private String applicantEmail;

    @Column(name = "applicant_id_card", nullable = false, length = 20)
    private String applicantIdCard; // CCCD

    @Column(name = "applicant_address", length = 255)
    private String applicantAddress;

    @Column(name = "form_data", columnDefinition = "TEXT")
    private String formData; // JSON string chứa dữ liệu biểu mẫu nộp

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "expected_completion_date")
    private LocalDateTime expectedCompletionDate;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "revision_notes", columnDefinition = "TEXT")
    private String revisionNotes;

    @Column(name = "result_summary", columnDefinition = "TEXT")
    private String resultSummary;

    @Column(name = "result_file_path", length = 500)
    private String resultFilePath;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ApplicationDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("actionTime ASC")
    @Builder.Default
    private List<ApplicationHistory> historyList = new ArrayList<>();
}
