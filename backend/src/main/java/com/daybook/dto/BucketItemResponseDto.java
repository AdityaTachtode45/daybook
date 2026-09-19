package com.daybook.dto;

import com.daybook.model.BucketCategory;
import com.daybook.model.BucketPriority;
import com.daybook.model.BucketStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BucketItemResponseDto {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private BucketCategory category;
    private BucketPriority priority;
    private BucketStatus status;
    private LocalDate targetDate;
    private String locationName;
    private String coverUrl;
    private String coverPublicId;
    private Integer sortOrder;
    private LocalDate completedDate;
    private String completedNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BucketStepsSummaryDto stepsSummary;
    private List<BucketStepDto> steps = new ArrayList<>();

    public BucketItemResponseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public String getCompletedNote() {
        return completedNote;
    }

    public void setCompletedNote(String completedNote) {
        this.completedNote = completedNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public BucketStepsSummaryDto getStepsSummary() {
        return stepsSummary;
    }

    public void setStepsSummary(BucketStepsSummaryDto stepsSummary) {
        this.stepsSummary = stepsSummary;
    }

    public List<BucketStepDto> getSteps() {
        return steps;
    }

    public void setSteps(List<BucketStepDto> steps) {
        this.steps = steps;
    }
}
