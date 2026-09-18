package com.citizenportal.backend.application.repository;

import com.citizenportal.backend.application.entity.Application;
import com.citizenportal.backend.application.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Optional<Application> findByApplicationCode(String applicationCode);

    boolean existsByApplicationCode(String applicationCode);

    Page<Application> findByCitizenId(Long citizenId, Pageable pageable);

    Page<Application> findByCitizenIdAndStatus(Long citizenId, ApplicationStatus status, Pageable pageable);

    Page<Application> findByStatus(ApplicationStatus status, Pageable pageable);

    Page<Application> findByAssignedStaffId(Long staffId, Pageable pageable);

    long countByStatus(ApplicationStatus status);

    long countByCitizenIdAndStatus(Long citizenId, ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.applicationCode LIKE CONCAT('HS', :year, '%')")
    long countApplicationsInYear(@Param("year") int year);

    @Query("SELECT DISTINCT a FROM Application a " +
           "LEFT JOIN FETCH a.citizen c " +
           "LEFT JOIN FETCH a.procedure p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH a.assignedStaff " +
           "WHERE a.id = :id")
    Optional<Application> findDetailById(@Param("id") Long id);

    @Query("SELECT DISTINCT a FROM Application a " +
           "LEFT JOIN FETCH a.citizen c " +
           "LEFT JOIN FETCH a.procedure p " +
           "LEFT JOIN FETCH p.category " +
           "LEFT JOIN FETCH a.assignedStaff " +
           "WHERE a.applicationCode = :code")
    Optional<Application> findDetailByCode(@Param("code") String code);

    @Query("SELECT a FROM Application a WHERE " +
           "LOWER(a.applicationCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.applicantName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.applicantPhone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.procedure.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Application> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT a FROM Application a WHERE a.status = :status " +
           "AND (LOWER(a.applicationCode) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(a.applicantName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(a.applicantPhone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "     OR LOWER(a.procedure.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Application> findByStatusAndKeyword(
            @Param("status") ApplicationStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
