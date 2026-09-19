package com.daybook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TagRequestDto {

    @NotBlank(message = "Tag name is required")
    @Size(max = 50, message = "Tag name must be 50 characters or less")
    private String name;

    @Size(max = 20, message = "Tag color must be 20 characters or less")
    private String color;

    public TagRequestDto() {
    }

    public TagRequestDto(String name, String color) {
        this.name = name;
        this.color = color;
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
}
