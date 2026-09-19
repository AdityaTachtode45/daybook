package com.daybook.controller;

import com.daybook.dto.SearchResponse;
import com.daybook.model.Mood;
import com.daybook.security.UserPrincipal;
import com.daybook.service.SearchService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<SearchResponse> searchEntries(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "tags", required = false) String tagsStr,
            @RequestParam(name = "mood", required = false) Mood mood,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "hasVideo", required = false) Boolean hasVideo,
            @RequestParam(name = "hasPhoto", required = false) Boolean hasPhoto,
            @RequestParam(name = "hasFile", required = false) Boolean hasFile,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sort", defaultValue = "newest") String sort
    ) {
        List<String> tagNames = Collections.emptyList();
        if (tagsStr != null && !tagsStr.isBlank()) {
            tagNames = Arrays.asList(tagsStr.split(","));
        }

        SearchResponse response = searchService.searchEntries(
                principal.getId(),
                q,
                tagNames,
                mood,
                from,
                to,
                hasVideo,
                hasPhoto,
                hasFile,
                page,
                size,
                sort
        );

        return ResponseEntity.ok(response);
    }
}
