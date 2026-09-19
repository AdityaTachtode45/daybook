package com.daybook.dto;

import com.daybook.model.Mood;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class SearchResultDto {
    private LocalDate entryDate;
    private String title;
    private String snippet;
    private Mood mood;
    private List<TagDto> tags = new ArrayList<>();
    private MediaCountsDto mediaCounts;

    public SearchResultDto() {
    }

    public SearchResultDto(LocalDate entryDate, String title, String snippet, Mood mood, List<TagDto> tags, MediaCountsDto mediaCounts) {
        this.entryDate = entryDate;
        this.title = title;
        this.snippet = snippet;
        this.mood = mood;
        this.tags = tags != null ? tags : new ArrayList<>();
        this.mediaCounts = mediaCounts;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public Mood getMood() {
        return mood;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }

    public List<TagDto> getTags() {
        return tags;
    }

    public void setTags(List<TagDto> tags) {
        this.tags = tags;
    }

    public MediaCountsDto getMediaCounts() {
        return mediaCounts;
    }

    public void setMediaCounts(MediaCountsDto mediaCounts) {
        this.mediaCounts = mediaCounts;
    }
}
