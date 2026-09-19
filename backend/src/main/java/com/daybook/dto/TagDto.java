package com.daybook.dto;

public class TagDto {
    private Long id;
    private String name;
    private String color;
    private long count;

    public TagDto() {
    }

    public TagDto(Long id, String name, String color) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.count = 0;
    }

    public TagDto(Long id, String name, String color, long count) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.count = count;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}
