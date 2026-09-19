package com.daybook.dto;

import java.time.LocalDate;

public class BucketCompleteRequestDto {
    private LocalDate date;
    private String note;

    public BucketCompleteRequestDto() {
    }

    public BucketCompleteRequestDto(LocalDate date, String note) {
        this.date = date;
        this.note = note;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
