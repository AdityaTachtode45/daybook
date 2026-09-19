package com.daybook.controller;

import com.daybook.dto.EntryRequestDto;
import com.daybook.dto.EntryResponseDto;
import com.daybook.dto.EntrySummaryDto;
import com.daybook.security.UserPrincipal;
import com.daybook.service.EntryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/entries")
public class EntryController {

    private final EntryService entryService;

    public EntryController(EntryService entryService) {
        this.entryService = entryService;
    }

    @GetMapping
    public ResponseEntity<List<EntrySummaryDto>> getCalendarEntries(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("year") int year,
            @RequestParam("month") int month
    ) {
        return ResponseEntity.ok(entryService.getCalendarEntries(principal.getId(), year, month));
    }

    @GetMapping("/{date}")
    public ResponseEntity<EntryResponseDto> getEntryByDate(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(entryService.getEntryByDate(principal.getId(), date));
    }

    @PutMapping("/{date}")
    public ResponseEntity<EntryResponseDto> upsertEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody EntryRequestDto dto
    ) {
        return ResponseEntity.ok(entryService.upsertEntry(principal.getId(), date, dto));
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<Void> deleteEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        entryService.deleteEntry(principal.getId(), date);
        return ResponseEntity.ok().build();
    }
}
