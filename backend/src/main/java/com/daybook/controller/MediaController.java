package com.daybook.controller;

import com.daybook.dto.MediaAttachmentDto;
import com.daybook.dto.MediaAttachmentRequest;
import com.daybook.dto.MediaGroupDto;
import com.daybook.dto.MediaSignatureResponse;
import com.daybook.security.UserPrincipal;
import com.daybook.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("/media/signature")
    public ResponseEntity<MediaSignatureResponse> getSignature(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "type", defaultValue = "raw") String type
    ) {
        return ResponseEntity.ok(mediaService.generateSignature(principal.getId(), type));
    }

    @GetMapping("/media/memories")
    public ResponseEntity<List<MediaGroupDto>> getMediaMemories(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(mediaService.getMediaMemoriesGroupedByDate(principal.getId()));
    }

    @PostMapping("/entries/{date}/media")
    public ResponseEntity<MediaAttachmentDto> addMedia(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Valid @RequestBody MediaAttachmentRequest request
    ) {
        return ResponseEntity.ok(mediaService.addMediaAttachment(principal.getId(), date, request));
    }

    @DeleteMapping("/media/{id}")
    public ResponseEntity<Void> deleteMedia(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long mediaId
    ) {
        mediaService.deleteMediaAttachment(principal.getId(), mediaId);
        return ResponseEntity.ok().build();
    }
}
