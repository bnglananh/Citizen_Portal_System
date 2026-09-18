package com.citizenportal.backend.procedure.entity;

import com.citizenportal.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "procedures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Procedure extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProcedureCategory category;

    @Column(name = "processing_duration_days", nullable = false)
    private Integer processingDurationDays;

    @Column(name = "fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal fee = BigDecimal.ZERO;

    @Column(name = "submission_method", length = 50)
    private String submissionMethod; // Trực tuyến, Trực tiếp

    @Column(name = "implementation_steps", columnDefinition = "TEXT")
    private String implementationSteps; // Các bước thực hiện

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions; // Điều kiện thực hiện

    @Column(name = "legal_basis", columnDefinition = "TEXT")
    private String legalBasis; // Căn cứ pháp lý

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "procedure", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProcedureRequiredDocument> requiredDocuments = new ArrayList<>();
}
