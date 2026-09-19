package com.daybook.dto;

import com.daybook.model.MediaType;
import java.time.LocalDateTime;

public class MediaAttachmentDto {
    private Long id;
    private Long entryId;
    private MediaType type;
    private String url;
    private String publicId;
    private String resourceType;
    private String fileName;
    private String mimeType;
    private Long sizeBytes;
    private LocalDateTime createdAt;

    public MediaAttachmentDto() {
    }

    public MediaAttachmentDto(Long id, Long entryId, MediaType type, String url, String publicId, String resourceType, String fileName, String mimeType, Long sizeBytes, LocalDateTime createdAt) {
        this.id = id;
        this.entryId = entryId;
        this.type = type;
        this.url = url;
        this.publicId = publicId;
        this.resourceType = resourceType;
        this.fileName = fileName;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEntryId() {
        return entryId;
    }

    public void setEntryId(Long entryId) {
        this.entryId = entryId;
    }

    public MediaType getType() {
        return type;
    }

    public void setType(MediaType type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
