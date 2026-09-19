package com.daybook.dto;

import com.daybook.model.Mood;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class EntrySummaryDto {
    private Long id;
    private LocalDate date;
    private String title;
    private Mood mood;
    private boolean hasMedia;
    private List<TagDto> tags = new ArrayList<>();

    public EntrySummaryDto() {
    }

    public EntrySummaryDto(Long id, LocalDate date, String title, Mood mood, boolean hasMedia, List<TagDto> tags) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.mood = mood;
        this.hasMedia = hasMedia;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Mood getMood() {
        return mood;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }

    public boolean isHasMedia() {
        return hasMedia;
    }

    public void setHasMedia(boolean hasMedia) {
        this.hasMedia = hasMedia;
    }

    public List<TagDto> getTags() {
        return tags;
    }

    public void setTags(List<TagDto> tags) {
        this.tags = tags;
    }
}
