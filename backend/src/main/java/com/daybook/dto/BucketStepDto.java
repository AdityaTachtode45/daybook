package com.daybook.dto;

import java.time.LocalDateTime;

public class BucketStepDto {
    private Long id;
    private Long itemId;
    private String text;
    private boolean done;
    private Integer sortOrder;
    private LocalDateTime createdAt;

    public BucketStepDto() {
    }

    public BucketStepDto(Long id, Long itemId, String text, boolean done, Integer sortOrder, LocalDateTime createdAt) {
        this.id = id;
        this.itemId = itemId;
        this.text = text;
        this.done = done;
        this.sortOrder = sortOrder;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
