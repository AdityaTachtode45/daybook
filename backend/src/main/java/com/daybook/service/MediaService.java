package com.daybook.service;

import com.cloudinary.Cloudinary;
import com.daybook.dto.MediaAttachmentDto;
import com.daybook.dto.MediaAttachmentRequest;
import com.daybook.dto.MediaGroupDto;
import com.daybook.dto.MediaSignatureResponse;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.DiaryEntry;
import com.daybook.model.MediaAttachment;
import com.daybook.model.Profile;
import com.daybook.model.User;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.MediaAttachmentRepository;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MediaService {

    private final Cloudinary cloudinary;
    private final MediaAttachmentRepository mediaRepository;
    private final DiaryEntryRepository entryRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:1234567890}")
    private String apiKey;

    @Value("${cloudinary.api-secret:secret}")
    private String apiSecret;

    public MediaService(
            Cloudinary cloudinary,
            MediaAttachmentRepository mediaRepository,
            DiaryEntryRepository entryRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository
    ) {
        this.cloudinary = cloudinary;
        this.mediaRepository = mediaRepository;
        this.entryRepository = entryRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public MediaSignatureResponse generateSignature(Long userId, String type) {
        long timestamp = System.currentTimeMillis() / 1000L;
        String folder = "daybook/" + userId;

        Map<String, Object> paramsToSign = new HashMap<>();
        paramsToSign.put("timestamp", timestamp);
        paramsToSign.put("folder", folder);

        String signature = cloudinary.apiSignRequest(paramsToSign, apiSecret);

        return new MediaSignatureResponse(signature, timestamp, apiKey, cloudName, folder, null);
    }

    @Transactional
    public MediaAttachmentDto addMediaAttachment(Long userId, LocalDate date, MediaAttachmentRequest request) {
        String tzStr = profileRepository.findByUserId(userId)
                .map(Profile::getTimezone)
                .orElse("UTC");

        ZoneId zoneId;
        try {
            zoneId = ZoneId.of(tzStr);
        } catch (Exception e) {
            zoneId = ZoneId.of("UTC");
        }

        LocalDate today = LocalDate.now(zoneId);
        if (date.isAfter(today)) {
            throw new BadRequestException("Media attachments can only be added to today's or past entries");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DiaryEntry entry = entryRepository.findByUserIdAndEntryDate(userId, date)
                .orElseGet(() -> {
                    DiaryEntry newEntry = new DiaryEntry(user, date);
                    return entryRepository.save(newEntry);
                });

        MediaAttachment attachment = new MediaAttachment();
        attachment.setEntry(entry);
        attachment.setUser(user);
        attachment.setType(request.getType());
        attachment.setUrl(request.getUrl());
        attachment.setPublicId(request.getPublicId());
        attachment.setResourceType(request.getResourceType() != null ? request.getResourceType() : request.getType().name().toLowerCase());
        attachment.setFileName(request.getFileName());
        attachment.setMimeType(request.getMimeType());
        attachment.setSizeBytes(request.getSizeBytes());

        MediaAttachment saved = mediaRepository.save(attachment);

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MediaGroupDto> getMediaMemoriesGroupedByDate(Long userId) {
        List<MediaAttachment> attachments = mediaRepository.findAllByUserIdOrderByEntryDateDesc(userId);

        Map<LocalDate, List<MediaAttachment>> groupedByDate = new LinkedHashMap<>();
        Map<LocalDate, DiaryEntry> entryMap = new HashMap<>();

        for (MediaAttachment ma : attachments) {
            DiaryEntry entry = ma.getEntry();
            LocalDate date = entry.getEntryDate();
            groupedByDate.computeIfAbsent(date, k -> new ArrayList<>()).add(ma);
            entryMap.putIfAbsent(date, entry);
        }

        List<MediaGroupDto> result = new ArrayList<>();
        for (Map.Entry<LocalDate, List<MediaAttachment>> group : groupedByDate.entrySet()) {
            LocalDate date = group.getKey();
            DiaryEntry entry = entryMap.get(date);
            List<MediaAttachmentDto> dtoList = group.getValue().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            result.add(new MediaGroupDto(
                    date,
                    entry.getId(),
                    entry.getTitle(),
                    dtoList
            ));
        }

        return result;
    }

    @Transactional
    public void deleteMediaAttachment(Long userId, Long mediaId) {
        MediaAttachment attachment = mediaRepository.findByIdAndUserId(mediaId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Media attachment not found or access denied"));

        if (attachment.getPublicId() != null && !attachment.getPublicId().isBlank()) {
            try {
                Map<String, String> destroyOptions = new HashMap<>();
                if (attachment.getResourceType() != null) {
                    destroyOptions.put("resource_type", attachment.getResourceType());
                }
                cloudinary.uploader().destroy(attachment.getPublicId(), destroyOptions);
            } catch (Exception e) {
                // Log exception and proceed to delete from DB
            }
        }

        mediaRepository.delete(attachment);
    }

    private MediaAttachmentDto mapToDto(MediaAttachment saved) {
        return new MediaAttachmentDto(
                saved.getId(),
                saved.getEntry().getId(),
                saved.getType(),
                saved.getUrl(),
                saved.getPublicId(),
                saved.getResourceType(),
                saved.getFileName(),
                saved.getMimeType(),
                saved.getSizeBytes(),
                saved.getCreatedAt()
        );
    }
}
