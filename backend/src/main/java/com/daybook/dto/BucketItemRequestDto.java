package com.daybook.dto;

import com.daybook.model.BucketCategory;
import com.daybook.model.BucketPriority;
import com.daybook.model.BucketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class BucketItemRequestDto {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;
    private BucketCategory category;
    private BucketPriority priority;
    private BucketStatus status;
    private LocalDate targetDate;

    @Size(max = 200, message = "Location name must not exceed 200 characters")
    private String locationName;

    @Size(max = 1000, message = "Cover URL must not exceed 1000 characters")
    private String coverUrl;

    @Size(max = 500, message = "Cover public ID must not exceed 500 characters")
    private String coverPublicId;

    private Integer sortOrder;

    public BucketItemRequestDto() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BucketCategory getCategory() {
        return category;
    }

    public void setCategory(BucketCategory category) {
        this.category = category;
    }

    public BucketPriority getPriority() {
        return priority;
    }

    public void setPriority(BucketPriority priority) {
        this.priority = priority;
    }

    public BucketStatus getStatus() {
        return status;
    }

    public void setStatus(BucketStatus status) {
        this.status = status;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getCoverPublicId() {
        return coverPublicId;
    }

    public void setCoverPublicId(String coverPublicId) {
        this.coverPublicId = coverPublicId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
