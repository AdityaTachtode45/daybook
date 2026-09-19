package com.daybook.dto;

import java.util.ArrayList;
import java.util.List;

public class BucketStatsDto {
    private long total;
    private long done;
    private long inProgress;
    private long dreaming;
    private int completionPercent;
    private List<BucketCategoryStatDto> byCategory = new ArrayList<>();
    private long doneThisYear;
    private List<BucketItemResponseDto> nextUp = new ArrayList<>();

    public BucketStatsDto() {
    }

    public BucketStatsDto(long total, long done, long inProgress, long dreaming, int completionPercent,
                          List<BucketCategoryStatDto> byCategory, long doneThisYear, List<BucketItemResponseDto> nextUp) {
        this.total = total;
        this.done = done;
        this.inProgress = inProgress;
        this.dreaming = dreaming;
        this.completionPercent = completionPercent;
        this.byCategory = byCategory != null ? byCategory : new ArrayList<>();
        this.doneThisYear = doneThisYear;
        this.nextUp = nextUp != null ? nextUp : new ArrayList<>();
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

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }

    public long getDreaming() {
        return dreaming;
    }

    public void setDreaming(long dreaming) {
        this.dreaming = dreaming;
    }

    public int getCompletionPercent() {
        return completionPercent;
    }

    public void setCompletionPercent(int completionPercent) {
        this.completionPercent = completionPercent;
    }

    public List<BucketCategoryStatDto> getByCategory() {
        return byCategory;
    }

    public void setByCategory(List<BucketCategoryStatDto> byCategory) {
        this.byCategory = byCategory;
    }

    public long getDoneThisYear() {
        return doneThisYear;
    }

    public void setDoneThisYear(long doneThisYear) {
        this.doneThisYear = doneThisYear;
    }

    public List<BucketItemResponseDto> getNextUp() {
        return nextUp;
    }

    public void setNextUp(List<BucketItemResponseDto> nextUp) {
        this.nextUp = nextUp;
    }
}
