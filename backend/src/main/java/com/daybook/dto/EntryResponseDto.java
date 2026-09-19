package com.daybook.dto;

import com.daybook.model.Mood;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class EntryResponseDto {
    private Long id;
    private LocalDate entryDate;
    private String title;
    private String content;
    private Mood mood;
    private List<MediaAttachmentDto> attachments = new ArrayList<>();
    private List<TagDto> tags = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EntryResponseDto() {
    }

    public EntryResponseDto(Long id, LocalDate entryDate, String title, String content, Mood mood, List<MediaAttachmentDto> attachments, List<TagDto> tags, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.entryDate = entryDate;
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.attachments = attachments != null ? attachments : new ArrayList<>();
        this.tags = tags != null ? tags : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Mood getMood() {
        return mood;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }

    public List<MediaAttachmentDto> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<MediaAttachmentDto> attachments) {
        this.attachments = attachments;
    }

    public List<TagDto> getTags() {
        return tags;
    }

    public void setTags(List<TagDto> tags) {
        this.tags = tags;
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
