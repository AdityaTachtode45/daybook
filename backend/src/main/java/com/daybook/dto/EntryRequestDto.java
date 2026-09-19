package com.daybook.dto;

import com.daybook.model.Mood;
import java.util.ArrayList;
import java.util.List;

public class EntryRequestDto {
    private String title;
    private String content;
    private Mood mood;
    private List<String> tags = new ArrayList<>();

    public EntryRequestDto() {
    }

    public EntryRequestDto(String title, String content, Mood mood, List<String> tags) {
        this.title = title;
        this.content = content;
        this.mood = mood;
        this.tags = tags != null ? tags : new ArrayList<>();
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Mood getMood() {
        return mood;
    }

    public void setMood(Mood mood) {
        this.mood = mood;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags != null ? tags : new ArrayList<>();
    }
}
