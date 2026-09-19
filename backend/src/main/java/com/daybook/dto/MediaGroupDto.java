package com.daybook.dto;

import java.time.LocalDate;
import java.util.List;

public class MediaGroupDto {

    private LocalDate date;
    private Long entryId;
    private String entryTitle;
    private List<MediaAttachmentDto> items;

    public MediaGroupDto() {
    }

    public MediaGroupDto(LocalDate date, Long entryId, String entryTitle, List<MediaAttachmentDto> items) {
        this.date = date;
        this.entryId = entryId;
        this.entryTitle = entryTitle;
        this.items = items;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getEntryId() {
        return entryId;
    }

    public void setEntryId(Long entryId) {
        this.entryId = entryId;
    }

    public String getEntryTitle() {
        return entryTitle;
    }

    public void setEntryTitle(String entryTitle) {
        this.entryTitle = entryTitle;
    }

    public List<MediaAttachmentDto> getItems() {
        return items;
    }

    public void setItems(List<MediaAttachmentDto> items) {
        this.items = items;
    }
}
