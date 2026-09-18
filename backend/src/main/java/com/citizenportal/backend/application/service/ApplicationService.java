package com.citizenportal.backend.application.service;

import com.citizenportal.backend.application.dto.*;
import com.citizenportal.backend.application.entity.Application;
import com.citizenportal.backend.application.entity.ApplicationDocument;
import com.citizenportal.backend.application.entity.ApplicationHistory;
import com.citizenportal.backend.application.entity.ApplicationStatus;
import com.citizenportal.backend.application.mapper.ApplicationMapper;
import com.citizenportal.backend.application.repository.ApplicationDocumentRepository;
import com.citizenportal.backend.application.repository.ApplicationHistoryRepository;
import com.citizenportal.backend.application.repository.ApplicationRepository;
import com.citizenportal.backend.common.exception.BadRequestException;
import com.citizenportal.backend.common.exception.ForbiddenException;
import com.citizenportal.backend.common.exception.InvalidStatusTransitionException;
import com.citizenportal.backend.common.exception.ResourceNotFoundException;
import com.citizenportal.backend.common.response.PageResponse;
import com.citizenportal.backend.common.util.FileStorageService;
import com.citizenportal.backend.common.util.SecurityUtils;
import com.citizenportal.backend.notification.service.NotificationService;
import com.citizenportal.backend.procedure.entity.Procedure;
import com.citizenportal.backend.procedure.entity.ProcedureRequiredDocument;
import com.citizenportal.backend.procedure.repository.ProcedureRepository;
import com.citizenportal.backend.procedure.repository.ProcedureRequiredDocumentRepository;
import com.citizenportal.backend.security.CustomUserDetails;
import com.citizenportal.backend.user.entity.RoleType;
import com.citizenportal.backend.user.entity.User;
import com.citizenportal.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationDocumentRepository documentRepository;
    private final ApplicationHistoryRepository historyRepository;
    private final ProcedureRepository procedureRepository;
    private final ProcedureRequiredDocumentRepository procedureDocumentRepository;
    private final UserRepository userRepository;
    private final ApplicationMapper mapper;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    // =========================================================================
    // 👤 CITIZEN OPERATIONS
    // =========================================================================

    @Transactional
    public ApplicationDetailDto createDraft(CreateApplicationRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User citizen = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Procedure procedure = procedureRepository.findById(request.getProcedureId())
                .orElseThrow(() -> new ResourceNotFoundException("Procedure", "id", request.getProcedureId()));

        if (!procedure.isActive()) {
            throw new BadRequestException("Thủ tục này hiện không còn hoạt động để tiếp nhận hồ sơ");
        }

        String applicationCode = generateApplicationCode();

        Application application = Application.builder()
                .applicationCode(applicationCode)
                .citizen(citizen)
                .procedure(procedure)
                .status(ApplicationStatus.DRAFT)
                .applicantName(request.getApplicantName())
                .applicantPhone(request.getApplicantPhone())
                .applicantEmail(request.getApplicantEmail())
                .applicantIdCard(request.getApplicantIdCard())
                .applicantAddress(request.getApplicantAddress())
                .formData(request.getFormData())
                .build();

        Application saved = applicationRepository.save(application);

        recordHistory(saved, null, ApplicationStatus.DRAFT, citizen, "Tạo hồ sơ nháp", "Công dân khởi tạo hồ sơ nháp trực tuyến");

        return mapper.toDetailDto(saved);
    }

    @Transactional
    public ApplicationDetailDto submitApplication(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Application application = getAndVerifyOwnership(id, currentUserId);

        validateStatusTransition(application, ApplicationStatus.SUBMITTED);

        // Validate required documents
        List<ProcedureRequiredDocument> requiredDocs = procedureDocumentRepository
                .findByProcedureIdOrderByOrderIndexAsc(application.getProcedure().getId());

        List<ApplicationDocument> uploadedDocs = documentRepository.findByApplicationId(application.getId());

        for (ProcedureRequiredDocument reqDoc : requiredDocs) {
            if (reqDoc.isRequired()) {
                boolean uploaded = uploadedDocs.stream()
                        .anyMatch(d -> d.getRequiredDocument() != null && d.getRequiredDocument().getId().equals(reqDoc.getId()));
                if (!uploaded) {
                    throw new BadRequestException("Hồ sơ còn thiếu tài liệu bắt buộc: " + reqDoc.getDocumentName());
                }
            }
        }

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setSubmittedAt(LocalDateTime.now());
        application.setExpectedCompletionDate(
                LocalDateTime.now().plusDays(application.getProcedure().getProcessingDurationDays())
        );

        Application updated = applicationRepository.save(application);

        recordHistory(updated, oldStatus, ApplicationStatus.SUBMITTED, application.getCitizen(),
                "Nộp hồ sơ trực tuyến", "Người dân đã nộp hồ sơ thành công vào hệ thống");

        // 1. Gửi thông báo cho Công dân
        notificationService.createNotification(
                application.getCitizen(),
                updated,
                "Nộp hồ sơ thành công - " + updated.getApplicationCode(),
                String.format("Hồ sơ thủ tục '%s' của bạn đã được gửi thành công. Mã hồ sơ: %s.",
                        updated.getProcedure().getName(), updated.getApplicationCode()),
                "STATUS_CHANGE"
        );

        // 2. Gửi thông báo cho toàn bộ Cán bộ nghiệp vụ & Quản trị viên
        List<User> officers = userRepository.findByRoles(List.of(RoleType.ROLE_STAFF, RoleType.ROLE_ADMIN));
        String categoryName = updated.getProcedure().getCategory() != null ? updated.getProcedure().getCategory().getName() : "Hành chính";
        notificationService.notifyUsers(
                officers,
                updated,
                "Hồ sơ mới cần tiếp nhận - " + updated.getApplicationCode(),
                String.format("Công dân %s vừa nộp hồ sơ thủ tục '%s' (Lĩnh vực: %s). Vui lòng kiểm tra và tiếp nhận.",
                        updated.getApplicantName(), updated.getProcedure().getName(), categoryName),
                "NEW_APPLICATION"
        );

        return mapper.toDetailDto(updated);
    }

    @Transactional
    public ApplicationDocumentDto uploadDocument(Long applicationId, Long requiredDocumentId, String documentName, MultipartFile file) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Application application = getAndVerifyOwnership(applicationId, currentUserId);

        if (application.getStatus() != ApplicationStatus.DRAFT && application.getStatus() != ApplicationStatus.NEED_REVISION) {
            throw new BadRequestException("Chỉ có thể tải lên tài liệu khi hồ sơ ở trạng thái DRAFT hoặc NEED_REVISION");
        }

        ProcedureRequiredDocument reqDoc = null;
        if (requiredDocumentId != null) {
            reqDoc = procedureDocumentRepository.findById(requiredDocumentId)
                    .orElseThrow(() -> new ResourceNotFoundException("ProcedureRequiredDocument", "id", requiredDocumentId));
        }

        String subFolder = "applications/" + application.getId();
        String savedPath = fileStorageService.storeFile(file, subFolder);

        String docName = (documentName != null && !documentName.isBlank())
                ? documentName.trim()
                : (reqDoc != null ? reqDoc.getDocumentName() : file.getOriginalFilename());

        ApplicationDocument doc = ApplicationDocument.builder()
                .application(application)
                .requiredDocument(reqDoc)
                .documentName(docName)
                .originalFileName(file.getOriginalFilename())
                .filePath(savedPath)
                .fileSize(file.getSize())
                .fileType(file.getContentType())
                .build();

        return mapper.toDocumentDto(documentRepository.save(doc));
    }

    @Transactional
    public void deleteDocument(Long applicationId, Long documentId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Application application = getAndVerifyOwnership(applicationId, currentUserId);

        if (application.getStatus() != ApplicationStatus.DRAFT && application.getStatus() != ApplicationStatus.NEED_REVISION) {
            throw new BadRequestException("Không thể xóa tài liệu của hồ sơ này");
        }

        ApplicationDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("ApplicationDocument", "id", documentId));

        if (!doc.getApplication().getId().equals(application.getId())) {
            throw new BadRequestException("Tài liệu không thuộc hồ sơ này");
        }

        fileStorageService.deleteFile(doc.getFilePath());
        documentRepository.delete(doc);
    }

    @Transactional
    public ApplicationDetailDto resubmitApplication(Long id, String revisionNotes) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Application application = getAndVerifyOwnership(id, currentUserId);

        validateStatusTransition(application, ApplicationStatus.RESUBMITTED);

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(ApplicationStatus.RESUBMITTED);
        application.setRevisionNotes(revisionNotes);

        Application updated = applicationRepository.save(application);

        recordHistory(updated, oldStatus, ApplicationStatus.RESUBMITTED, application.getCitizen(),
                "Nộp lại hồ sơ bổ sung", revisionNotes != null ? revisionNotes : "Đã bổ sung tài liệu theo yêu cầu");

        // 1. Gửi thông báo cho Công dân
        notificationService.createNotification(
                application.getCitizen(),
                updated,
                "Đã gửi lại hồ sơ bổ sung - " + updated.getApplicationCode(),
                String.format("Hồ sơ %s đã được gửi lại để cán bộ tiếp tục xử lý.", updated.getApplicationCode()),
                "STATUS_CHANGE"
        );

        // 2. Gửi thông báo cho Cán bộ phụ trách (hoặc tất cả cán bộ nếu chưa phân công)
        if (updated.getAssignedStaff() != null) {
            notificationService.createNotification(
                    updated.getAssignedStaff(),
                    updated,
                    "Công dân đã bổ sung hồ sơ - " + updated.getApplicationCode(),
                    String.format("Công dân %s đã nộp lại hồ sơ '%s'. Nội dung: %s",
                            updated.getApplicantName(), updated.getProcedure().getName(),
                            revisionNotes != null ? revisionNotes : "Đã bổ sung tài liệu theo yêu cầu"),
                    "REQUIRE_REVISION"
            );
        } else {
            List<User> officers = userRepository.findByRoles(List.of(RoleType.ROLE_STAFF, RoleType.ROLE_ADMIN));
            notificationService.notifyUsers(
                    officers,
                    updated,
                    "Hồ sơ bổ sung cần xử lý - " + updated.getApplicationCode(),
                    String.format("Công dân %s đã nộp lại hồ sơ '%s'. Nội dung: %s",
                            updated.getApplicantName(), updated.getProcedure().getName(),
                            revisionNotes != null ? revisionNotes : "Đã bổ sung tài liệu theo yêu cầu"),
                    "REQUIRE_REVISION"
            );
        }

        return mapper.toDetailDto(updated);
    }

    public PageResponse<ApplicationSummaryDto> getMyApplications(ApplicationStatus status, Pageable pageable) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Page<Application> page;
        if (status != null) {
            page = applicationRepository.findByCitizenIdAndStatus(currentUserId, status, pageable);
        } else {
            page = applicationRepository.findByCitizenId(currentUserId, pageable);
        }
        return PageResponse.fromPage(page.map(mapper::toSummaryDto));
    }

    public ApplicationDetailDto getApplicationDetail(Long id) {
        CustomUserDetails currentUser = SecurityUtils.getCurrentUserDetails()
                .orElseThrow(() -> new ForbiddenException("Yêu cầu đăng nhập"));

        Application application = applicationRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        boolean isStaffOrAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaffOrAdmin && !application.getCitizen().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Bạn không có quyền xem thông tin hồ sơ này");
        }

        return mapper.toDetailDto(application);
    }

    public ApplicationDetailDto getApplicationByCodePublic(String code) {
        Application application = applicationRepository.findDetailByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Application", "code", code));
        return mapper.toDetailDto(application);
    }

    // =========================================================================
    // 💼 STAFF OPERATIONS
    // =========================================================================

    public PageResponse<ApplicationSummaryDto> getStaffApplications(ApplicationStatus status, String keyword, Pageable pageable) {
        Page<Application> page;
        boolean hasKeyword = keyword != null && !keyword.trim().isBlank();
        String kw = hasKeyword ? keyword.trim() : null;

        if (status != null && hasKeyword) {
            page = applicationRepository.findByStatusAndKeyword(status, kw, pageable);
        } else if (status != null) {
            page = applicationRepository.findByStatus(status, pageable);
        } else if (hasKeyword) {
            page = applicationRepository.findByKeyword(kw, pageable);
        } else {
            page = applicationRepository.findAll(pageable);
        }
        return PageResponse.fromPage(page.map(mapper::toSummaryDto));
    }

    @Transactional
    public ApplicationDetailDto performStaffAction(Long id, StaffActionRequest request, MultipartFile resultFile) {
        Long currentStaffId = SecurityUtils.getCurrentUserId();
        User staff = userRepository.findById(currentStaffId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentStaffId));

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        ApplicationStatus targetStatus;
        String actionName;
        String notificationTitle;
        String notificationContent;
        String notificationType = "STATUS_CHANGE";

        switch (request.getAction().trim().toUpperCase()) {
            case "RECEIVE":
                targetStatus = ApplicationStatus.RECEIVED;
                actionName = "Tiếp nhận hồ sơ";
                application.setAssignedStaff(staff);
                notificationTitle = "Hồ sơ đã được tiếp nhận - " + application.getApplicationCode();
                notificationContent = "Cán bộ " + staff.getFullName() + " đã tiếp nhận và đang thẩm định hồ sơ '" + application.getProcedure().getName() + "' của bạn.";
                break;

            case "PROCESS":
                targetStatus = ApplicationStatus.PROCESSING;
                actionName = "Chuyển xử lý";
                notificationTitle = "Hồ sơ đang được giải quyết - " + application.getApplicationCode();
                notificationContent = "Hồ sơ của bạn đang được cán bộ chuyên môn tiến hành giải quyết.";
                break;

            case "REQUEST_REVISION":
                if (request.getRevisionNotes() == null || request.getRevisionNotes().isBlank()) {
                    throw new BadRequestException("Bắt buộc phải nhập lý do/nội dung yêu cầu bổ sung hồ sơ");
                }
                targetStatus = ApplicationStatus.NEED_REVISION;
                actionName = "Yêu cầu bổ sung hồ sơ";
                application.setRevisionNotes(request.getRevisionNotes().trim());
                notificationTitle = "Yêu cầu bổ sung hồ sơ - " + application.getApplicationCode();
                notificationContent = "Hồ sơ của bạn cần bổ sung giấy tờ: " + request.getRevisionNotes().trim();
                notificationType = "REQUIRE_REVISION";
                break;

            case "REJECT":
                if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                    throw new BadRequestException("Bắt buộc phải nhập lý do từ chối hồ sơ");
                }
                targetStatus = ApplicationStatus.REJECTED;
                actionName = "Từ chối hồ sơ";
                application.setRejectionReason(request.getRejectionReason().trim());
                application.setCompletedAt(LocalDateTime.now());
                notificationTitle = "Hồ sơ bị từ chối giải quyết - " + application.getApplicationCode();
                notificationContent = "Hồ sơ thủ tục '" + application.getProcedure().getName() + "' đã bị từ chối. Lý do: " + request.getRejectionReason().trim();
                notificationType = "REJECTED";
                break;

            case "COMPLETE":
                targetStatus = ApplicationStatus.COMPLETED;
                actionName = "Phê duyệt & Hoàn tất";
                application.setResultSummary(request.getResultSummary());
                application.setCompletedAt(LocalDateTime.now());

                if (resultFile != null && !resultFile.isEmpty()) {
                    String subFolder = "applications/" + application.getId() + "/results";
                    String savedPath = fileStorageService.storeFile(resultFile, subFolder);
                    application.setResultFilePath(savedPath);
                }

                notificationTitle = "Hồ sơ đã hoàn tất & có kết quả - " + application.getApplicationCode();
                String resSummary = (request.getResultSummary() != null && !request.getResultSummary().isBlank())
                        ? " Kết quả: " + request.getResultSummary().trim()
                        : " Đã ban hành kết quả giải quyết.";
                String attachNote = (resultFile != null && !resultFile.isEmpty()) ? " Bạn có thể tải tệp kết quả điện tử trong chi tiết hồ sơ." : "";
                notificationContent = "Hồ sơ thủ tục '" + application.getProcedure().getName() + "' của bạn đã được phê duyệt và hoàn tất thành công." + resSummary + attachNote;
                notificationType = "COMPLETED";
                break;

            default:
                throw new BadRequestException("Hành động xử lý không hợp lệ: " + request.getAction());
        }

        validateStatusTransition(application, targetStatus);

        ApplicationStatus oldStatus = application.getStatus();
        application.setStatus(targetStatus);
        Application updated = applicationRepository.save(application);

        String comment = (request.getComments() != null && !request.getComments().isBlank())
                ? request.getComments().trim()
                : (request.getRevisionNotes() != null ? request.getRevisionNotes().trim() : request.getRejectionReason());

        recordHistory(updated, oldStatus, targetStatus, staff, actionName, comment);

        notificationService.createNotification(
                application.getCitizen(),
                updated,
                notificationTitle,
                notificationContent,
                notificationType
        );

        return mapper.toDetailDto(updated);
    }

    public List<ApplicationHistoryDto> getApplicationHistory(Long id) {
        getApplicationDetail(id); // Check access permissions
        return historyRepository.findByApplicationIdOrderByActionTimeAsc(id)
                .stream()
                .map(mapper::toHistoryDto)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // 🛡️ HELPER METHODS (Security & State Machine)
    // =========================================================================

    private Application getAndVerifyOwnership(Long id, Long currentUserId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application", "id", id));

        if (!application.getCitizen().getId().equals(currentUserId)) {
            throw new ForbiddenException("Bạn không có quyền thao tác trên hồ sơ này (IDOR Protection)");
        }
        return application;
    }

    private void validateStatusTransition(Application application, ApplicationStatus targetStatus) {
        if (!application.getStatus().canTransitionTo(targetStatus)) {
            throw new InvalidStatusTransitionException(
                    application.getStatus().getDisplayName(),
                    targetStatus.getDisplayName()
            );
        }
    }

    private void recordHistory(
            Application app,
            ApplicationStatus from,
            ApplicationStatus to,
            User actor,
            String actionName,
            String comments
    ) {
        ApplicationHistory history = ApplicationHistory.builder()
                .application(app)
                .fromStatus(from)
                .toStatus(to)
                .actionBy(actor)
                .actionName(actionName)
                .comments(comments)
                .actionTime(LocalDateTime.now())
                .build();
        historyRepository.save(history);
    }

    private synchronized String generateApplicationCode() {
        int currentYear = Year.now().getValue();
        long countThisYear = applicationRepository.countApplicationsInYear(currentYear) + 1;
        String code;
        do {
            code = String.format("HS%d%05d", currentYear, countThisYear++);
        } while (applicationRepository.existsByApplicationCode(code));
        return code;
    }
}
