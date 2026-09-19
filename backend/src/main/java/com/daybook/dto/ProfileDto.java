package com.daybook.dto;

import java.time.LocalDate;

public class ProfileDto {
    private Long id;
    private Long userId;
    private String email;
    private String displayName;
    private String bio;
    private String avatarUrl;
    private String timezone;
    private LocalDate dateOfBirth;
    private String location;

    public ProfileDto() {
    }

    public ProfileDto(Long id, Long userId, String email, String displayName, String bio, String avatarUrl, String timezone, LocalDate dateOfBirth, String location) {
        this.id = id;
        this.userId = userId;
        this.email = email;
        this.displayName = displayName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.timezone = timezone;
        this.dateOfBirth = dateOfBirth;
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
