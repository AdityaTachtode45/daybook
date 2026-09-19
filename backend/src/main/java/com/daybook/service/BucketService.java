package com.daybook.service;

import com.cloudinary.Cloudinary;
import com.daybook.dto.*;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.*;
import com.daybook.repository.BucketItemRepository;
import com.daybook.repository.BucketStepRepository;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BucketService {

    private final BucketItemRepository bucketItemRepository;
    private final BucketStepRepository bucketStepRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final Cloudinary cloudinary;

    public BucketService(
            BucketItemRepository bucketItemRepository,
            BucketStepRepository bucketStepRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            Cloudinary cloudinary
    ) {
        this.bucketItemRepository = bucketItemRepository;
        this.bucketStepRepository = bucketStepRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.cloudinary = cloudinary;
    }

    private ZoneId getUserZoneId(Long userId) {
        String tzStr = profileRepository.findByUserId(userId)
                .map(Profile::getTimezone)
                .orElse("UTC");
        try {
            return ZoneId.of(tzStr);
        } catch (Exception e) {
            return ZoneId.of("UTC");
        }
    }

    @Transactional(readOnly = true)
    public List<BucketItemResponseDto> getItems(Long userId, BucketStatus status, BucketCategory category, String q, String sort) {
        String queryParam = (q != null && !q.trim().isEmpty()) ? q.trim() : null;
        List<BucketItem> items = bucketItemRepository.searchItems(userId, status, category, queryParam);

        Comparator<BucketItem> comparator;
        String sortOption = (sort != null) ? sort.toLowerCase() : "manual";

        switch (sortOption) {
            case "newest":
                comparator = Comparator.comparing(BucketItem::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
                break;
            case "targetdate":
                comparator = Comparator.comparing(BucketItem::getTargetDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(BucketItem::getId);
                break;
            case "priority":
                comparator = Comparator.comparing((BucketItem item) -> {
                    if (item.getPriority() == BucketPriority.HIGH) return 1;
                    if (item.getPriority() == BucketPriority.MEDIUM) return 2;
                    return 3;
                }).thenComparing(BucketItem::getId);
                break;
            case "manual":
            default:
                comparator = Comparator.comparing((BucketItem item) -> {
                    if (item.getStatus() == BucketStatus.DREAMING) return 1;
                    if (item.getStatus() == BucketStatus.IN_PROGRESS) return 2;
                    return 3;
                }).thenComparing(BucketItem::getSortOrder, Comparator.nullsLast(Comparator.naturalOrder()))
                  .thenComparing(BucketItem::getId);
                break;
        }

        items.sort(comparator);

        return items.stream()
                .map(item -> mapToItemResponseDto(item, true))
                .collect(Collectors.toList());
    }

    @Transactional
    public BucketItemResponseDto createItem(Long userId, BucketItemRequestDto request) {
        long count = bucketItemRepository.countByUserId(userId);
        if (count >= 200) {
            throw new BadRequestException("Maximum limit of 200 bucket list items reached");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BucketItem item = new BucketItem(user, request.getTitle().trim());
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        item.setCategory(request.getCategory() != null ? request.getCategory() : BucketCategory.OTHER);
        item.setPriority(request.getPriority() != null ? request.getPriority() : BucketPriority.MEDIUM);
        item.setStatus(request.getStatus() != null ? request.getStatus() : BucketStatus.DREAMING);
        item.setTargetDate(request.getTargetDate());
        item.setLocationName(request.getLocationName());
        item.setCoverUrl(request.getCoverUrl());
        item.setCoverPublicId(request.getCoverPublicId());

        if (request.getSortOrder() != null) {
            item.setSortOrder(request.getSortOrder());
        } else {
            Integer maxSort = bucketItemRepository.findMaxSortOrderByUserIdAndStatus(userId, item.getStatus());
            item.setSortOrder(maxSort == null ? 0 : maxSort + 1);
        }

        BucketItem saved = bucketItemRepository.save(item);
        return mapToItemResponseDto(saved, true);
    }

    @Transactional(readOnly = true)
    public BucketItemResponseDto getItemById(Long userId, Long itemId) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));
        return mapToItemResponseDto(item, true);
    }

    @Transactional
    public BucketItemResponseDto updateItem(Long userId, Long itemId, BucketItemRequestDto request) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            item.setTitle(request.getTitle().trim());
        }
        item.setDescription(request.getDescription());
        if (request.getCategory() != null) item.setCategory(request.getCategory());
        if (request.getPriority() != null) item.setPriority(request.getPriority());
        if (request.getStatus() != null) item.setStatus(request.getStatus());
        item.setTargetDate(request.getTargetDate());
        item.setLocationName(request.getLocationName());
        item.setCoverUrl(request.getCoverUrl());
        item.setCoverPublicId(request.getCoverPublicId());
        if (request.getSortOrder() != null) item.setSortOrder(request.getSortOrder());

        BucketItem saved = bucketItemRepository.save(item);
        return mapToItemResponseDto(saved, true);
    }

    @Transactional
    public void deleteItem(Long userId, Long itemId) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));

        if (item.getCoverPublicId() != null && !item.getCoverPublicId().isBlank()) {
            try {
                Map<String, String> destroyOptions = new HashMap<>();
                destroyOptions.put("resource_type", "image");
                cloudinary.uploader().destroy(item.getCoverPublicId(), destroyOptions);
            } catch (Exception e) {
                // Ignore failure on Cloudinary cleanup
            }
        }

        bucketItemRepository.delete(item);
    }

    @Transactional
    public void reorderItems(Long userId, List<BucketReorderItemDto> reorderItems) {
        if (reorderItems == null || reorderItems.isEmpty()) return;

        List<Long> ids = reorderItems.stream().map(BucketReorderItemDto::getId).collect(Collectors.toList());
        List<BucketItem> items = bucketItemRepository.findAllById(ids);

        if (items.size() != ids.size()) {
            throw new BadRequestException("Invalid item ID present in reorder list");
        }

        for (BucketItem item : items) {
            if (!item.getUser().getId().equals(userId)) {
                throw new BadRequestException("Access denied for one or more items in reorder list");
            }
        }

        Map<Long, BucketItem> itemMap = items.stream().collect(Collectors.toMap(BucketItem::getId, i -> i));

        for (BucketReorderItemDto dto : reorderItems) {
            BucketItem item = itemMap.get(dto.getId());
            if (item != null) {
                item.setStatus(dto.getStatus());
                item.setSortOrder(dto.getSortOrder());
            }
        }

        bucketItemRepository.saveAll(items);
    }

    @Transactional
    public BucketItemResponseDto completeItem(Long userId, Long itemId, BucketCompleteRequestDto request) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));

        ZoneId zoneId = getUserZoneId(userId);
        LocalDate today = LocalDate.now(zoneId);

        LocalDate completionDate = (request != null && request.getDate() != null) ? request.getDate() : today;

        if (completionDate.isAfter(today)) {
            throw new BadRequestException("Completion date cannot be in the future");
        }

        item.setStatus(BucketStatus.DONE);
        item.setCompletedDate(completionDate);
        item.setCompletedNote(request != null ? request.getNote() : null);

        if (item.getSteps() != null) {
            for (BucketStep step : item.getSteps()) {
                step.setDone(true);
            }
        }

        BucketItem saved = bucketItemRepository.save(item);
        return mapToItemResponseDto(saved, true);
    }

    @Transactional
    public BucketItemResponseDto reopenItem(Long userId, Long itemId) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));

        item.setStatus(BucketStatus.IN_PROGRESS);
        item.setCompletedDate(null);
        item.setCompletedNote(null);

        BucketItem saved = bucketItemRepository.save(item);
        return mapToItemResponseDto(saved, true);
    }

    @Transactional
    public BucketStepDto addStep(Long userId, Long itemId, BucketStepRequestDto request) {
        BucketItem item = bucketItemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket item not found or access denied"));

        long count = bucketStepRepository.countByItemId(itemId);
        if (count >= 30) {
            throw new BadRequestException("Maximum limit of 30 steps per item reached");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BucketStep step = new BucketStep(item, user, request.getText().trim());
        if (request.getDone() != null) step.setDone(request.getDone());

        if (request.getSortOrder() != null) {
            step.setSortOrder(request.getSortOrder());
        } else {
            Integer maxSort = bucketStepRepository.findMaxSortOrderByItemId(itemId);
            step.setSortOrder(maxSort == null ? 0 : maxSort + 1);
        }

        BucketStep saved = bucketStepRepository.save(step);
        item.getSteps().add(saved);

        return mapToStepDto(saved);
    }

    @Transactional
    public BucketStepDto updateStep(Long userId, Long stepId, BucketStepRequestDto request) {
        BucketStep step = bucketStepRepository.findByIdAndUserId(stepId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket step not found or access denied"));

        if (request.getText() != null && !request.getText().trim().isEmpty()) {
            step.setText(request.getText().trim());
        }

        boolean previousDone = step.isDone();
        if (request.getDone() != null) {
            step.setDone(request.getDone());
        }

        if (request.getSortOrder() != null) {
            step.setSortOrder(request.getSortOrder());
        }

        BucketStep saved = bucketStepRepository.save(step);
        BucketItem item = saved.getItem();

        // If the first step is checked and status is DREAMING, move it to IN_PROGRESS
        if (!previousDone && saved.isDone() && item.getStatus() == BucketStatus.DREAMING) {
            item.setStatus(BucketStatus.IN_PROGRESS);
            bucketItemRepository.save(item);
        }

        return mapToStepDto(saved);
    }

    @Transactional
    public void deleteStep(Long userId, Long stepId) {
        BucketStep step = bucketStepRepository.findByIdAndUserId(stepId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Bucket step not found or access denied"));

        BucketItem item = step.getItem();
        if (item.getSteps() != null) {
            item.getSteps().remove(step);
        }
        bucketStepRepository.delete(step);
    }

    @Transactional(readOnly = true)
    public List<BucketByDateDto> getItemsByDate(Long userId, LocalDate date) {
        List<BucketItem> items = bucketItemRepository.findByUserIdAndCompletedDate(userId, date);
        return items.stream()
                .map(item -> new BucketByDateDto(
                        item.getId(),
                        item.getTitle(),
                        item.getCategory(),
                        item.getCoverUrl(),
                        item.getCompletedNote()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BucketCompletedDateCountDto> getCompletedDates(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Object[]> rawList = bucketItemRepository.countCompletedByDateGrouped(userId, startDate, endDate);
        List<BucketCompletedDateCountDto> result = new ArrayList<>();

        for (Object[] obj : rawList) {
            LocalDate date = (LocalDate) obj[0];
            long count = ((Number) obj[1]).longValue();
            result.add(new BucketCompletedDateCountDto(date, count));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public BucketStatsDto getStats(Long userId) {
        long total = bucketItemRepository.countByUserId(userId);
        long dreaming = bucketItemRepository.countByUserIdAndStatus(userId, BucketStatus.DREAMING);
        long inProgress = bucketItemRepository.countByUserIdAndStatus(userId, BucketStatus.IN_PROGRESS);
        long done = bucketItemRepository.countByUserIdAndStatus(userId, BucketStatus.DONE);

        int completionPercent = total == 0 ? 0 : (int) Math.round((done * 100.0) / total);

        ZoneId zoneId = getUserZoneId(userId);
        int currentYear = LocalDate.now(zoneId).getYear();
        LocalDate yearStart = LocalDate.of(currentYear, 1, 1);
        LocalDate yearEnd = LocalDate.of(currentYear, 12, 31);

        long doneThisYear = bucketItemRepository.countByUserIdAndStatusAndCompletedDateBetween(userId, BucketStatus.DONE, yearStart, yearEnd);

        List<BucketItem> allItems = bucketItemRepository.findByUserId(userId);

        Map<BucketCategory, Long> categoryTotalMap = new HashMap<>();
        Map<BucketCategory, Long> categoryDoneMap = new HashMap<>();

        for (BucketItem item : allItems) {
            BucketCategory cat = item.getCategory();
            categoryTotalMap.put(cat, categoryTotalMap.getOrDefault(cat, 0L) + 1);
            if (item.getStatus() == BucketStatus.DONE) {
                categoryDoneMap.put(cat, categoryDoneMap.getOrDefault(cat, 0L) + 1);
            }
        }

        List<BucketCategoryStatDto> byCategory = new ArrayList<>();
        for (BucketCategory cat : BucketCategory.values()) {
            long catTotal = categoryTotalMap.getOrDefault(cat, 0L);
            long catDone = categoryDoneMap.getOrDefault(cat, 0L);
            byCategory.add(new BucketCategoryStatDto(cat, catTotal, catDone));
        }

        // nextUp: up to 3 non-completed items (in progress first, then earliest target date, then high priority)
        List<BucketItem> candidateItems = allItems.stream()
                .filter(item -> item.getStatus() != BucketStatus.DONE)
                .sorted((a, b) -> {
                    // 1. IN_PROGRESS first
                    if (a.getStatus() != b.getStatus()) {
                        if (a.getStatus() == BucketStatus.IN_PROGRESS) return -1;
                        if (b.getStatus() == BucketStatus.IN_PROGRESS) return 1;
                    }

                    // 2. Earliest target date (non-null before null)
                    if (a.getTargetDate() != null && b.getTargetDate() != null) {
                        int c = a.getTargetDate().compareTo(b.getTargetDate());
                        if (c != 0) return c;
                    } else if (a.getTargetDate() != null) {
                        return -1;
                    } else if (b.getTargetDate() != null) {
                        return 1;
                    }

                    // 3. High priority first
                    int priorityA = a.getPriority() == BucketPriority.HIGH ? 1 : (a.getPriority() == BucketPriority.MEDIUM ? 2 : 3);
                    int priorityB = b.getPriority() == BucketPriority.HIGH ? 1 : (b.getPriority() == BucketPriority.MEDIUM ? 2 : 3);
                    if (priorityA != priorityB) {
                        return Integer.compare(priorityA, priorityB);
                    }

                    return Long.compare(a.getId(), b.getId());
                })
                .limit(3)
                .collect(Collectors.toList());

        List<BucketItemResponseDto> nextUpDtos = candidateItems.stream()
                .map(item -> mapToItemResponseDto(item, true))
                .collect(Collectors.toList());

        return new BucketStatsDto(total, done, inProgress, dreaming, completionPercent, byCategory, doneThisYear, nextUpDtos);
    }

    private BucketStepsSummaryDto calculateStepsSummary(List<BucketStep> steps) {
        if (steps == null || steps.isEmpty()) {
            return new BucketStepsSummaryDto(0, 0, 0);
        }
        int total = steps.size();
        int doneCount = (int) steps.stream().filter(BucketStep::isDone).count();
        int percent = (int) Math.round((doneCount * 100.0) / total);
        return new BucketStepsSummaryDto(total, doneCount, percent);
    }

    private BucketItemResponseDto mapToItemResponseDto(BucketItem item, boolean includeSteps) {
        BucketItemResponseDto dto = new BucketItemResponseDto();
        dto.setId(item.getId());
        dto.setUserId(item.getUser().getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCategory(item.getCategory());
        dto.setPriority(item.getPriority());
        dto.setStatus(item.getStatus());
        dto.setTargetDate(item.getTargetDate());
        dto.setLocationName(item.getLocationName());
        dto.setCoverUrl(item.getCoverUrl());
        dto.setCoverPublicId(item.getCoverPublicId());
        dto.setSortOrder(item.getSortOrder());
        dto.setCompletedDate(item.getCompletedDate());
        dto.setCompletedNote(item.getCompletedNote());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());

        List<BucketStep> stepList = item.getSteps();
        dto.setStepsSummary(calculateStepsSummary(stepList));

        if (includeSteps && stepList != null) {
            List<BucketStepDto> stepDtos = stepList.stream()
                    .map(this::mapToStepDto)
                    .collect(Collectors.toList());
            dto.setSteps(stepDtos);
        }

        return dto;
    }

    private BucketStepDto mapToStepDto(BucketStep step) {
        return new BucketStepDto(
                step.getId(),
                step.getItem().getId(),
                step.getText(),
                step.isDone(),
                step.getSortOrder(),
                step.getCreatedAt()
        );
    }
}
