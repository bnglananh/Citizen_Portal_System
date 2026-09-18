package com.citizenportal.backend.common.util;

import com.citizenportal.backend.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "jpg", "jpeg", "png", "doc", "docx"
    );

    public FileStorageService(@Value("${application.upload.dir:./uploads}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ tệp tin tải lên", ex);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        if (file.isEmpty()) {
            throw new BadRequestException("Tệp tin tải lên rỗng");
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = getFileExtension(originalFileName);

        if (!ALLOWED_EXTENSIONS.contains(fileExtension.toLowerCase())) {
            throw new BadRequestException("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các tệp: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        try {
            Path targetFolder = this.fileStorageLocation.resolve(subFolder).normalize();
            Files.createDirectories(targetFolder);

            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_");
            Path targetLocation = targetFolder.resolve(uniqueFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return subFolder + "/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Không thể lưu trữ tệp tin: " + originalFileName, ex);
        }
    }

    public Resource loadFileAsResource(String relativeFilePath) {
        try {
            Path filePath = this.fileStorageLocation.resolve(relativeFilePath).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new BadRequestException("Không tìm thấy hoặc không thể đọc tệp tin: " + relativeFilePath);
            }
        } catch (MalformedURLException ex) {
            throw new BadRequestException("Đường dẫn tệp tin không hợp lệ: " + relativeFilePath, ex);
        }
    }

    public boolean deleteFile(String relativeFilePath) {
        try {
            Path filePath = this.fileStorageLocation.resolve(relativeFilePath).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            log.error("Lỗi khi xóa tệp: {}", relativeFilePath, ex);
            return false;
        }
    }

    private String getFileExtension(String fileName) {
        int lastIndex = fileName.lastIndexOf('.');
        if (lastIndex == -1) {
            return "";
        }
        return fileName.substring(lastIndex + 1);
    }
}
