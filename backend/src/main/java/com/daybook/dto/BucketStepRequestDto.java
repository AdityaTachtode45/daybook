package com.daybook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BucketStepRequestDto {

    @NotBlank(message = "Step text is required")
    @Size(max = 300, message = "Step text must not exceed 300 characters")
    private String text;

    private Boolean done;
    private Integer sortOrder;

    public BucketStepRequestDto() {
    }

    public BucketStepRequestDto(String text, Boolean done, Integer sortOrder) {
        this.text = text;
        this.done = done;
        this.sortOrder = sortOrder;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Boolean getDone() {
        return done;
    }

    public void setDone(Boolean done) {
        this.done = done;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
