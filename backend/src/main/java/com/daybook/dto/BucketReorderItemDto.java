package com.daybook.dto;

import com.daybook.model.BucketStatus;
import jakarta.validation.constraints.NotNull;

public class BucketReorderItemDto {

    @NotNull(message = "Item ID is required")
    private Long id;

    @NotNull(message = "Status is required")
    private BucketStatus status;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    public BucketReorderItemDto() {
    }

    public BucketReorderItemDto(Long id, BucketStatus status, Integer sortOrder) {
        this.id = id;
        this.status = status;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BucketStatus getStatus() {
        return status;
    }

    public void setStatus(BucketStatus status) {
        this.status = status;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
