package com.daybook.controller;

import com.daybook.dto.TagDto;
import com.daybook.dto.TagRequestDto;
import com.daybook.security.UserPrincipal;
import com.daybook.service.TagService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ResponseEntity<List<TagDto>> getUserTags(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(tagService.getUserTags(principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TagDto> updateTag(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long tagId,
            @Valid @RequestBody TagRequestDto request
    ) {
        return ResponseEntity.ok(tagService.updateTag(principal.getId(), tagId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long tagId
    ) {
        tagService.deleteTag(principal.getId(), tagId);
        return ResponseEntity.ok().build();
    }
}
