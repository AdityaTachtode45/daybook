package com.daybook.service;

import com.daybook.dto.ProfileDto;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.Profile;
import com.daybook.model.User;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.MediaAttachmentRepository;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.RefreshTokenRepository;
import com.daybook.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DiaryEntryRepository entryRepository;
    private final MediaAttachmentRepository mediaAttachmentRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final com.daybook.repository.BucketItemRepository bucketItemRepository;
    private final com.daybook.repository.BucketStepRepository bucketStepRepository;

    public ProfileService(
            ProfileRepository profileRepository,
            UserRepository userRepository,
            DiaryEntryRepository entryRepository,
            MediaAttachmentRepository mediaAttachmentRepository,
            RefreshTokenRepository refreshTokenRepository,
            com.daybook.repository.BucketItemRepository bucketItemRepository,
            com.daybook.repository.BucketStepRepository bucketStepRepository
    ) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
        this.entryRepository = entryRepository;
        this.mediaAttachmentRepository = mediaAttachmentRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.bucketItemRepository = bucketItemRepository;
        this.bucketStepRepository = bucketStepRepository;
    }

    @Transactional(readOnly = true)
    public ProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile p = new Profile(user);
                    return profileRepository.save(p);
                });

        return mapToDto(profile, user.getEmail());
    }

    @Transactional
    public ProfileDto updateProfile(Long userId, ProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> new Profile(user));

        if (dto.getDisplayName() != null) profile.setDisplayName(dto.getDisplayName());
        if (dto.getBio() != null) profile.setBio(dto.getBio());
        if (dto.getAvatarUrl() != null) profile.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getTimezone() != null) profile.setTimezone(dto.getTimezone());
        if (dto.getDateOfBirth() != null) profile.setDateOfBirth(dto.getDateOfBirth());
        if (dto.getLocation() != null) profile.setLocation(dto.getLocation());

        Profile updated = profileRepository.save(profile);
        return mapToDto(updated, user.getEmail());
    }

    @Transactional
    public void deleteAccount(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        bucketStepRepository.deleteByUserId(userId);
        bucketItemRepository.deleteByUserId(userId);
        mediaAttachmentRepository.deleteByUserId(userId);
        entryRepository.deleteByUserId(userId);
        profileRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }

    private ProfileDto mapToDto(Profile profile, String email) {
        return new ProfileDto(
                profile.getId(),
                profile.getUser().getId(),
                email,
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getTimezone(),
                profile.getDateOfBirth(),
                profile.getLocation()
        );
    }
}
