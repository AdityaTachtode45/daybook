package com.daybook.dto;

import com.daybook.model.BucketCategory;

public class BucketCategoryStatDto {
    private BucketCategory category;
    private long total;
    private long done;

    public BucketCategoryStatDto() {
    }

    public BucketCategoryStatDto(BucketCategory category, long total, long done) {
        this.category = category;
        this.total = total;
        this.done = done;
    }

    public BucketCategory getCategory() {
        return category;
    }

    public void setCategory(BucketCategory category) {
        this.category = category;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getDone() {
        return done;
    }

    public void setDone(long done) {
        this.done = done;
    }
}
