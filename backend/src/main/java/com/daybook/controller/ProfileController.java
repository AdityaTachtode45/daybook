package com.daybook.controller;

import com.daybook.dto.ProfileDto;
import com.daybook.security.UserPrincipal;
import com.daybook.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getProfile(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getId()));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileDto> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ProfileDto dto
    ) {
        return ResponseEntity.ok(profileService.updateProfile(principal.getId(), dto));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal UserPrincipal principal) {
        profileService.deleteAccount(principal.getId());
        return ResponseEntity.ok().build();
    }
}
