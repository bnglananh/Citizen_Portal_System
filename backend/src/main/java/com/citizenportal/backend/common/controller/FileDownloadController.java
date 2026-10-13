package com.citizenportal.backend.common.controller;

import com.citizenportal.backend.common.util.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@Tag(name = "File Download", description = "API tải về và xem tài liệu/hình ảnh đính kèm")
public class FileDownloadController {

    private final FileStorageService fileStorageService;

    @GetMapping("/api/download")
    @Operation(summary = "Tải về hoặc xem tệp tài liệu/hình ảnh đính kèm")
    public ResponseEntity<Resource> downloadFile(@RequestParam("filePath") String filePath, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(filePath);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ignored) {}

        if (contentType == null) {
            String lower = filePath.toLowerCase();
            if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else if (lower.endsWith(".pdf")) contentType = "application/pdf";
            else contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
