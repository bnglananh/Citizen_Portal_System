package com.citizenportal.backend.procedure.entity;

import com.citizenportal.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "procedure_required_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcedureRequiredDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "procedure_id", nullable = false)
    private Procedure procedure;

    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private boolean required = true;

    @Column(name = "template_file_path", length = 500)
    private String templateFilePath;

    @Column(name = "order_index")
    @Builder.Default
    private Integer orderIndex = 0;
}
