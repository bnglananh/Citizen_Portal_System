package com.citizenportal.backend.procedure.repository;

import com.citizenportal.backend.procedure.entity.ProcedureCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedureCategoryRepository extends JpaRepository<ProcedureCategory, Long> {
    Optional<ProcedureCategory> findByCode(String code);
    List<ProcedureCategory> findByActiveTrue();
    boolean existsByCode(String code);
}
