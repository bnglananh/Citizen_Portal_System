package com.citizenportal.backend.faq.repository;

import com.citizenportal.backend.faq.entity.Faq;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    List<Faq> findByActiveTrueOrderByOrderIndexAsc();

    List<Faq> findByCategoryAndActiveTrueOrderByOrderIndexAsc(String category);

    Page<Faq> findByActiveTrue(Pageable pageable);

    @Query("SELECT f FROM Faq f WHERE (LOWER(f.question) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(f.answer) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Faq> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}
