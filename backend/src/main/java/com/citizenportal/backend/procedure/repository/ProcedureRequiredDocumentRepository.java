package com.citizenportal.backend.procedure.repository;

import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcedureRequiredDocumentRepository extends JpaRepository<ProcedureRequiredDocument, Long> {
    List<ProcedureRequiredDocument> findByProcedureIdOrderByOrderIndexAsc(Long procedureId);
    List<ProcedureRequiredDocument> findByProcedure(Procedure procedure);
    void deleteByProcedure(Procedure procedure);
}

