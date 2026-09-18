package com.citizenportal.backend.faq.service;

import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.faq.dto.CreateFaqRequest;
import com.citizenportal.backend.faq.dto.FaqDto;
import com.citizenportal.backend.faq.entity.Faq;
import com.citizenportal.backend.faq.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqService {

    private final FaqRepository faqRepository;

    public List<FaqDto> getPublicFaqs() {
        return faqRepository.findByActiveTrueOrderByOrderIndexAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PageResponse<FaqDto> searchFaqs(String keyword, Pageable pageable) {
        Page<Faq> page;
        if (keyword != null && !keyword.trim().isEmpty()) {
            page = faqRepository.searchByKeyword(keyword.trim(), pageable);
        } else {
            page = faqRepository.findAll(pageable);
        }
        return PageResponse.fromPage(page.map(this::toDto));
    }

    public FaqDto getFaqById(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", "id", id));
        return toDto(faq);
    }

    @Transactional
    public FaqDto createFaq(CreateFaqRequest request) {
        Faq faq = Faq.builder()
                .question(request.getQuestion().trim())
                .answer(request.getAnswer().trim())
                .category(request.getCategory())
                .orderIndex(request.getOrderIndex())
                .active(request.isActive())
                .build();
        return toDto(faqRepository.save(faq));
    }

    @Transactional
    public FaqDto updateFaq(Long id, CreateFaqRequest request) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", "id", id));

        faq.setQuestion(request.getQuestion().trim());
        faq.setAnswer(request.getAnswer().trim());
        faq.setCategory(request.getCategory());
        faq.setOrderIndex(request.getOrderIndex());
        faq.setActive(request.isActive());

        return toDto(faqRepository.save(faq));
    }

    @Transactional
    public void deleteFaq(Long id) {
        Faq faq = faqRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faq", "id", id));
        faq.setActive(false);
        faqRepository.save(faq);
    }

    private FaqDto toDto(Faq faq) {
        return FaqDto.builder()
                .id(faq.getId())
                .question(faq.getQuestion())
                .answer(faq.getAnswer())
                .category(faq.getCategory())
                .orderIndex(faq.getOrderIndex())
                .active(faq.isActive())
                .createdAt(faq.getCreatedAt())
                .build();
    }
}
