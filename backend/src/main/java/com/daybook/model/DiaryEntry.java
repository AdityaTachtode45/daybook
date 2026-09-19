package com.daybook.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(
    name = "diary_entries",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_entry_date", columnNames = {"user_id", "entry_date"})
    },
    indexes = {
        @Index(name = "idx_user_entry_date", columnList = "user_id, entry_date")
    }
)
public class DiaryEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "content_text", columnDefinition = "LONGTEXT")
    private String contentText;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Mood mood;

    @OneToMany(mappedBy = "entry", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MediaAttachment> attachments = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "entry_tags",
        joinColumns = @JoinColumn(name = "entry_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public DiaryEntry() {
    }

    public DiaryEntry(User user, LocalDate entryDate) {
        this.user = user;
        this.entryDate = entryDate;
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

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public Mood getMood() {
        return mood;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }

    public List<MediaAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<MediaAttachment> attachments) {
        this.attachments = attachments;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags != null ? tags : new HashSet<>();
    }

    public void addAttachment(MediaAttachment attachment) {
        attachments.add(attachment);
        attachment.setEntry(this);
    }

    public void removeAttachment(MediaAttachment attachment) {
        attachments.remove(attachment);
        attachment.setEntry(null);
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
