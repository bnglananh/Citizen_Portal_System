package com.citizenportal.backend.support.repository;

import com.citizenportal.backend.support.entity.SupportConversation;
import com.citizenportal.backend.support.entity.SupportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportConversationRepository extends JpaRepository<SupportConversation, Long> {

    @Query("SELECT c FROM SupportConversation c WHERE c.citizen.id = :citizenId AND c.status = :status ORDER BY c.updatedAt DESC")
    List<SupportConversation> findByCitizenIdAndStatus(@Param("citizenId") Long citizenId, @Param("status") SupportStatus status);

    @Query("SELECT c FROM SupportConversation c WHERE c.citizen.id = :citizenId ORDER BY c.updatedAt DESC")
    List<SupportConversation> findByCitizenIdOrderByUpdatedAtDesc(@Param("citizenId") Long citizenId);

    @Query("SELECT c FROM SupportConversation c WHERE c.staff.id = :staffId ORDER BY c.updatedAt DESC")
    List<SupportConversation> findByStaffIdOrderByUpdatedAtDesc(@Param("staffId") Long staffId);

    @Query("SELECT c FROM SupportConversation c WHERE " +
           "(c.staff.id = :staffId) OR " +
           "(c.staff IS NULL AND c.status = com.citizenportal.backend.support.entity.SupportStatus.OPEN) " +
           "ORDER BY c.updatedAt DESC")
    List<SupportConversation> findAvailableForStaff(@Param("staffId") Long staffId);

    List<SupportConversation> findAllByOrderByUpdatedAtDesc();
}
