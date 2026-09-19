package com.daybook.dto;

public class BucketStepsSummaryDto {
    private int stepsTotal;
    private int stepsDone;
    private int progressPercent;

    public BucketStepsSummaryDto() {
    }

    public BucketStepsSummaryDto(int stepsTotal, int stepsDone, int progressPercent) {
        this.stepsTotal = stepsTotal;
        this.stepsDone = stepsDone;
        this.progressPercent = progressPercent;
    }

    public int getStepsTotal() {
        return stepsTotal;
    }

    public void setStepsTotal(int stepsTotal) {
        this.stepsTotal = stepsTotal;
    }

    public int getStepsDone() {
        return stepsDone;
    }

    public void setStepsDone(int stepsDone) {
        this.stepsDone = stepsDone;
    }

    public int getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(int progressPercent) {
        this.progressPercent = progressPercent;
    }
}
