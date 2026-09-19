package com.daybook.service;

import com.daybook.dto.EntryRequestDto;
import com.daybook.dto.EntryResponseDto;
import com.daybook.dto.EntrySummaryDto;
import com.daybook.dto.MediaAttachmentDto;
import com.daybook.dto.TagDto;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.DiaryEntry;
import com.daybook.model.Profile;
import com.daybook.model.User;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EntryService {

    private final DiaryEntryRepository entryRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final TagService tagService;

    public EntryService(
            DiaryEntryRepository entryRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            TagService tagService
    ) {
        this.entryRepository = entryRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.tagService = tagService;
    }

    @Transactional(readOnly = true)
    public List<EntrySummaryDto> getCalendarEntries(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<DiaryEntry> entries = entryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(userId, startDate, endDate);

        return entries.stream().map(entry -> {
            List<TagDto> tagDtos = entry.getTags().stream()
                    .map(t -> new TagDto(t.getId(), t.getName(), t.getColor()))
                    .collect(Collectors.toList());

            return new EntrySummaryDto(
                    entry.getId(),
                    entry.getEntryDate(),
                    entry.getTitle(),
                    entry.getMood(),
                    !entry.getAttachments().isEmpty(),
                    tagDtos
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EntryResponseDto getEntryByDate(Long userId, LocalDate date) {
        Optional<DiaryEntry> entryOpt = entryRepository.findByUserIdAndEntryDate(userId, date);
        if (entryOpt.isEmpty()) {
            throw new ResourceNotFoundException("No entry found for date: " + date);
        }
        return mapToDto(entryOpt.get());
    }

    @Transactional
    public EntryResponseDto upsertEntry(Long userId, LocalDate date, EntryRequestDto dto) {
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
            throw new BadRequestException("Entries can only be created for today and past dates");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        DiaryEntry entry = entryRepository.findByUserIdAndEntryDate(userId, date)
                .orElseGet(() -> new DiaryEntry(user, date));

        entry.setTitle(dto.getTitle());
        entry.setContent(dto.getContent());
        entry.setContentText(SearchService.extractPlainText(dto.getContent()));
        entry.setMood(dto.getMood());

        // Process and assign tags
        tagService.processAndAssignTags(user, entry, dto.getTags());

        DiaryEntry saved = entryRepository.save(entry);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteEntry(Long userId, LocalDate date) {
        entryRepository.deleteByUserIdAndEntryDate(userId, date);
    }

    private EntryResponseDto mapToDto(DiaryEntry entry) {
        List<MediaAttachmentDto> attachmentDtos = entry.getAttachments().stream().map(att -> new MediaAttachmentDto(
                att.getId(),
                entry.getId(),
                att.getType(),
                att.getUrl(),
                att.getPublicId(),
                att.getResourceType(),
                att.getFileName(),
                att.getMimeType(),
                att.getSizeBytes(),
                att.getCreatedAt()
        )).collect(Collectors.toList());

        List<TagDto> tagDtos = entry.getTags().stream()
                .map(t -> new TagDto(t.getId(), t.getName(), t.getColor()))
                .collect(Collectors.toList());

        return new EntryResponseDto(
                entry.getId(),
                entry.getEntryDate(),
                entry.getTitle(),
                entry.getContent(),
                entry.getMood(),
                attachmentDtos,
                tagDtos,
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
