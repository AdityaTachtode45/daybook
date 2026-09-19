package com.daybook.dto;

import java.util.ArrayList;
import java.util.List;

public class SearchResponse {
    private List<SearchResultDto> content = new ArrayList<>();
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    public SearchResponse() {
    }

    public SearchResponse(List<SearchResultDto> content, int page, int size, long totalElements, int totalPages) {
        this.content = content != null ? content : new ArrayList<>();
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    public List<SearchResultDto> getContent() {
        return content;
    }

    public void setContent(List<SearchResultDto> content) {
        this.content = content;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}
