package com.citizenportal.backend.procedure.service;

import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.procedure.dto.CreateProcedureRequest;
import com.citizenportal.backend.procedure.dto.ProcedureDto;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureCategory;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import com.citizenportal.backend.procedure.mapper.ProcedureMapper;
import com.citizenportal.backend.procedure.repository.ProcedureCategoryRepository;
import com.citizenportal.backend.procedure.repository.ProcedureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcedureService {

    private final ProcedureRepository procedureRepository;
    private final ProcedureCategoryRepository categoryRepository;
    private final ProcedureMapper mapper;

    public PageResponse<ProcedureDto> searchPublicProcedures(String keyword, Long categoryId, Pageable pageable) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Page<Procedure> page;
        if (cleanKeyword != null && categoryId != null) {
            page = procedureRepository.findByCategoryAndKeyword(categoryId, cleanKeyword, pageable);
        } else if (cleanKeyword != null) {
            page = procedureRepository.findByKeyword(cleanKeyword, pageable);
        } else if (categoryId != null) {
            page = procedureRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
        } else {
            page = procedureRepository.findByActiveTrue(pageable);
        }
        return PageResponse.fromPage(page.map(mapper::toDto));
    }

    public PageResponse<ProcedureDto> getAllProcedures(Pageable pageable) {
        Page<Procedure> page = procedureRepository.findAll(pageable);
        return PageResponse.fromPage(page.map(mapper::toDto));
    }

    public ProcedureDto getProcedureById(Long id) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure", "id", id));
        return mapper.toDto(procedure);
    }

    public ProcedureDto getProcedureByCode(String code) {
        Procedure procedure = procedureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure", "code", code));
        return mapper.toDto(procedure);
    }

    @Transactional
    public ProcedureDto createProcedure(CreateProcedureRequest request) {
        if (procedureRepository.existsByCode(request.getCode().trim())) {
            throw new BadRequestException("Mã thủ tục hành chính đã tồn tại trong hệ thống");
        }

        ProcedureCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ProcedureCategory", "id", request.getCategoryId()));

        Procedure procedure = Procedure.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .description(request.getDescription())
                .category(category)
                .processingDurationDays(request.getProcessingDurationDays())
                .fee(request.getFee())
                .submissionMethod(request.getSubmissionMethod())
                .implementationSteps(request.getImplementationSteps())
                .conditions(request.getConditions())
                .legalBasis(request.getLegalBasis())
                .active(request.isActive())
                .requiredDocuments(new ArrayList<>())
                .build();

        if (request.getRequiredDocuments() != null) {
            for (var docReq : request.getRequiredDocuments()) {
                ProcedureRequiredDocument doc = ProcedureRequiredDocument.builder()
                        .procedure(procedure)
                        .documentName(docReq.getDocumentName().trim())
                        .description(docReq.getDescription())
                        .required(docReq.isRequired())
                        .templateFilePath(docReq.getTemplateFilePath())
                        .orderIndex(docReq.getOrderIndex())
                        .build();
                procedure.getRequiredDocuments().add(doc);
            }
        }

        return mapper.toDto(procedureRepository.save(procedure));
    }

    @Transactional
    public ProcedureDto updateProcedure(Long id, CreateProcedureRequest request) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure", "id", id));

        if (!procedure.getCode().equalsIgnoreCase(request.getCode().trim())
                && procedureRepository.existsByCode(request.getCode().trim())) {
            throw new BadRequestException("Mã thủ tục đã tồn tại");
        }

        ProcedureCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ProcedureCategory", "id", request.getCategoryId()));

        procedure.setCode(request.getCode().trim().toUpperCase());
        procedure.setName(request.getName().trim());
        procedure.setDescription(request.getDescription());
        procedure.setCategory(category);
        procedure.setProcessingDurationDays(request.getProcessingDurationDays());
        procedure.setFee(request.getFee());
        procedure.setSubmissionMethod(request.getSubmissionMethod());
        procedure.setImplementationSteps(request.getImplementationSteps());
        procedure.setConditions(request.getConditions());
        procedure.setLegalBasis(request.getLegalBasis());
        procedure.setActive(request.isActive());

        if (request.getRequiredDocuments() != null) {
            procedure.getRequiredDocuments().clear();
            for (var docReq : request.getRequiredDocuments()) {
                ProcedureRequiredDocument doc = ProcedureRequiredDocument.builder()
                        .procedure(procedure)
                        .documentName(docReq.getDocumentName().trim())
                        .description(docReq.getDescription())
                        .required(docReq.isRequired())
                        .templateFilePath(docReq.getTemplateFilePath())
                        .orderIndex(docReq.getOrderIndex())
                        .build();
                procedure.getRequiredDocuments().add(doc);
            }
        }

        return mapper.toDto(procedureRepository.save(procedure));
    }

    @Transactional
    public void deleteProcedure(Long id) {
        Procedure procedure = procedureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure", "id", id));
        procedure.setActive(false);
        procedureRepository.save(procedure);
    }
}
