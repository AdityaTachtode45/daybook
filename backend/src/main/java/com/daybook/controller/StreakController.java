package com.daybook.controller;

import com.daybook.dto.StreakDto;
import com.daybook.security.UserPrincipal;
import com.daybook.service.StreakService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/streaks")
public class StreakController {

    private final StreakService streakService;

    public StreakController(StreakService streakService) {
        this.streakService = streakService;
    }

    @GetMapping
    public ResponseEntity<StreakDto> getStreaks(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(streakService.calculateStreaks(principal.getId()));
    }
}
