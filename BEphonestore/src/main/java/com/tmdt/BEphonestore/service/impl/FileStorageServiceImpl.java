package com.tmdt.BEphonestore.service.impl;

import com.tmdt.BEphonestore.exception.BadRequestException;
import com.tmdt.BEphonestore.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path fileStorageLocation;

    // Allowed image extensions (including jfif which is a JPEG format)
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "webp", "bmp", "jfif");

    // Max file size: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public FileStorageServiceImpl(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new BadRequestException("Could not create upload directory: " + ex.getMessage());
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate filename
        if (originalFileName.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFileName);
        }

        // Get file extension - try multiple methods
        String fileExtension = "";

        // Method 1: Extract from filename
        int lastDotIndex = originalFileName.lastIndexOf(".");
        if (lastDotIndex > 0 && lastDotIndex < originalFileName.length() - 1) {
            fileExtension = originalFileName.substring(lastDotIndex + 1).toLowerCase();
        }

        // Method 2: If no extension or just a dot, try content type
        if (fileExtension.isEmpty() || fileExtension.length() > 4) {
            String contentType = file.getContentType();
            if (contentType != null) {
                contentType = contentType.toLowerCase();
                switch (contentType) {
                    case "image/jpeg":
                    case "image/jpg":
                    case "image/pjpeg": // Progressive JPEG
                    case "image/jfif": // JFIF format
                        fileExtension = "jpg";
                        break;
                    case "image/png":
                    case "image/x-png":
                        fileExtension = "png";
                        break;
                    case "image/gif":
                        fileExtension = "gif";
                        break;
                    case "image/webp":
                        fileExtension = "webp";
                        break;
                    case "image/bmp":
                    case "image/x-ms-bmp":
                        fileExtension = "bmp";
                        break;
                    default:
                        if (contentType.startsWith("image/")) {
                            fileExtension = contentType.substring(6);
                        }
                }
            }
        }

        // Normalize common variations
        if (fileExtension.equals("jpeg")) {
            fileExtension = "jpg";
        } else if (fileExtension.equals("jfif")) {
            fileExtension = "jpg"; // JFIF is actually JPEG format
        }

        // Debug logging
        System.out.println("Original filename: " + originalFileName);
        System.out.println("Detected extension: " + fileExtension);
        System.out.println("Content type: " + file.getContentType());

        // Validate extension
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new BadRequestException(
                    "Invalid file type. Allowed types: " + String.join(", ", ALLOWED_EXTENSIONS) +
                            ". Detected: " + fileExtension);
        }

        // Generate unique filename - always save as jpg for JPEG variants
        String saveExtension = fileExtension;
        if (fileExtension.equals("jfif")) {
            saveExtension = "jpg";
        }
        String newFileName = UUID.randomUUID().toString() + "." + saveExtension;

        try {
            // Copy file to target location
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return newFileName;
        } catch (IOException ex) {
            throw new BadRequestException("Could not store file: " + ex.getMessage());
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            System.err.println("Could not delete file " + fileName + ": " + ex.getMessage());
        }
    }
}