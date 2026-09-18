package com.citizenportal.backend.application.entity;

import com.citizenportal.backend.common.entity.BaseEntity;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "application_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "required_document_id")
    private ProcedureRequiredDocument requiredDocument;

    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    private String originalFileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type", length = 100)
    private String fileType;
}
