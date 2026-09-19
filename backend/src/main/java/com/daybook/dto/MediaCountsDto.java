package com.daybook.dto;

public class MediaCountsDto {
    private int videos;
    private int photos;
    private int files;

    public MediaCountsDto() {
    }

    public MediaCountsDto(int videos, int photos, int files) {
        this.videos = videos;
        this.photos = photos;
        this.files = files;
    }

    public int getVideos() {
        return videos;
    }

    public void setVideos(int videos) {
        this.videos = videos;
    }

    public int getPhotos() {
        return photos;
    }

    public void setPhotos(int photos) {
        this.photos = photos;
    }

    public int getFiles() {
        return files;
    }

    public void setFiles(int files) {
        this.files = files;
    }
}
