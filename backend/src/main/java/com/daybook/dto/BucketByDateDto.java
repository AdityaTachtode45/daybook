package com.daybook.dto;

import com.daybook.model.BucketCategory;

public class BucketByDateDto {
    private Long id;
    private String title;
    private BucketCategory category;
    private String coverUrl;
    private String completedNote;

    public BucketByDateDto() {
    }

    public BucketByDateDto(Long id, String title, BucketCategory category, String coverUrl, String completedNote) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.coverUrl = coverUrl;
        this.completedNote = completedNote;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BucketCategory getCategory() {
        return category;
    }

    public void setCategory(BucketCategory category) {
        this.category = category;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public String getCompletedNote() {
        return completedNote;
    }

    public void setCompletedNote(String completedNote) {
        this.completedNote = completedNote;
    }
}
