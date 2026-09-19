package com.daybook.controller;

import com.daybook.dto.*;
import com.daybook.model.BucketCategory;
import com.daybook.model.BucketStatus;
import com.daybook.security.UserPrincipal;
import com.daybook.service.BucketService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bucket")
public class BucketController {

    private final BucketService bucketService;

    public BucketController(BucketService bucketService) {
        this.bucketService = bucketService;
    }

    @GetMapping
    public ResponseEntity<List<BucketItemResponseDto>> getItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "status", required = false) BucketStatus status,
            @RequestParam(name = "category", required = false) BucketCategory category,
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "sort", required = false, defaultValue = "manual") String sort
    ) {
        return ResponseEntity.ok(bucketService.getItems(principal.getId(), status, category, q, sort));
    }

    @PostMapping
    public ResponseEntity<BucketItemResponseDto> createItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BucketItemRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bucketService.createItem(principal.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BucketItemResponseDto> getItemById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(bucketService.getItemById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BucketItemResponseDto> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            @RequestBody BucketItemRequestDto request
    ) {
        return ResponseEntity.ok(bucketService.updateItem(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id
    ) {
        bucketService.deleteItem(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderItems(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody List<BucketReorderItemDto> reorderItems
    ) {
        bucketService.reorderItems(principal.getId(), reorderItems);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<BucketItemResponseDto> completeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            @RequestBody(required = false) BucketCompleteRequestDto request
    ) {
        return ResponseEntity.ok(bucketService.completeItem(principal.getId(), id, request));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<BucketItemResponseDto> reopenItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id
    ) {
        return ResponseEntity.ok(bucketService.reopenItem(principal.getId(), id));
    }

    @PostMapping("/{id}/steps")
    public ResponseEntity<BucketStepDto> addStep(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long id,
            @Valid @RequestBody BucketStepRequestDto request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bucketService.addStep(principal.getId(), id, request));
    }

    @PutMapping("/steps/{stepId}")
    public ResponseEntity<BucketStepDto> updateStep(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("stepId") Long stepId,
            @RequestBody BucketStepRequestDto request
    ) {
        return ResponseEntity.ok(bucketService.updateStep(principal.getId(), stepId, request));
    }

    @DeleteMapping("/steps/{stepId}")
    public ResponseEntity<Void> deleteStep(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("stepId") Long stepId
    ) {
        bucketService.deleteStep(principal.getId(), stepId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-date/{date}")
    public ResponseEntity<List<BucketByDateDto>> getItemsByDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bucketService.getItemsByDate(principal.getId(), date));
    }

    @GetMapping("/completed-dates")
    public ResponseEntity<List<BucketCompletedDateCountDto>> getCompletedDates(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        return ResponseEntity.ok(bucketService.getCompletedDates(principal.getId(), year, month));
    }

    @GetMapping("/stats")
    public ResponseEntity<BucketStatsDto> getStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(bucketService.getStats(principal.getId()));
    }
}
