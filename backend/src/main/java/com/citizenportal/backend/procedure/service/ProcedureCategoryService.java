package com.citizenportal.backend.procedure.service;

import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.procedure.dto.CreateCategoryRequest;
import com.citizenportal.backend.procedure.dto.ProcedureCategoryDto;
import com.citizenportal.backend.procedure.entity.ProcedureCategory;
import com.citizenportal.backend.procedure.mapper.ProcedureMapper;
import com.citizenportal.backend.procedure.repository.ProcedureCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcedureCategoryService {

    private final ProcedureCategoryRepository categoryRepository;
    private final ProcedureMapper mapper;

    public List<ProcedureCategoryDto> getAllActiveCategories() {
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(mapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public List<ProcedureCategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(mapper::toCategoryDto)
                .collect(Collectors.toList());
    }

    public ProcedureCategoryDto getCategoryById(Long id) {
        ProcedureCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcedureCategory", "id", id));
        return mapper.toCategoryDto(category);
    }

    @Transactional
    public ProcedureCategoryDto createCategory(CreateCategoryRequest request) {
        if (categoryRepository.existsByCode(request.getCode().trim())) {
            throw new BadRequestException("Mã lĩnh vực/danh mục đã tồn tại trong hệ thống");
        }

        ProcedureCategory category = ProcedureCategory.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .description(request.getDescription())
                .icon(request.getIcon())
                .active(request.isActive())
                .build();

        return mapper.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public ProcedureCategoryDto updateCategory(Long id, CreateCategoryRequest request) {
        ProcedureCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcedureCategory", "id", id));

        if (!category.getCode().equalsIgnoreCase(request.getCode().trim())
                && categoryRepository.existsByCode(request.getCode().trim())) {
            throw new BadRequestException("Mã lĩnh vực/danh mục đã tồn tại");
        }

        category.setCode(request.getCode().trim().toUpperCase());
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setIcon(request.getIcon());
        category.setActive(request.isActive());

        return mapper.toCategoryDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long id) {
        ProcedureCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProcedureCategory", "id", id));
        category.setActive(false);
        categoryRepository.save(category);
    }
}
