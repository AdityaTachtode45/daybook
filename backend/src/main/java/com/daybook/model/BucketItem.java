package com.daybook.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "bucket_items",
    indexes = {
        @Index(name = "idx_bucket_items_user_status_sort", columnList = "user_id, status, sort_order"),
        @Index(name = "idx_bucket_items_user_completed", columnList = "user_id, completed_date")
    }
)
public class BucketItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private BucketCategory category = BucketCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private BucketPriority priority = BucketPriority.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(length = 50, nullable = false)
    private BucketStatus status = BucketStatus.DREAMING;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "location_name", length = 200)
    private String locationName;

    @Column(name = "cover_url", length = 1000)
    private String coverUrl;

    @Column(name = "cover_public_id", length = 500)
    private String coverPublicId;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "completed_note", columnDefinition = "TEXT")
    private String completedNote;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    private List<BucketStep> steps = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public BucketItem() {
    }

    public BucketItem(User user, String title) {
        this.user = user;
        this.title = title;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public List<BucketStep> getSteps() {
        return steps;
    }

    public void setSteps(List<BucketStep> steps) {
        this.steps = steps;
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
}
