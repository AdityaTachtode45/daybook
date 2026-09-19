package com.daybook.service;

import com.daybook.dto.TagDto;
import com.daybook.dto.TagRequestDto;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.DiaryEntry;
import com.daybook.model.Tag;
import com.daybook.model.User;
import com.daybook.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public List<TagDto> getUserTags(Long userId) {
        List<Object[]> results = tagRepository.findTagsWithUsageCountByUserIdRaw(userId);
        if (results.isEmpty()) {
            List<Tag> allTags = tagRepository.findByUserId(userId);
            return allTags.stream().map(t -> new TagDto(t.getId(), t.getName(), t.getColor(), 0L))
                    .collect(Collectors.toList());
        }

        return results.stream().map(row -> {
            Tag tag = (Tag) row[0];
            Long count = (Long) row[1];
            return new TagDto(tag.getId(), tag.getName(), tag.getColor(), count != null ? count : 0L);
        }).collect(Collectors.toList());
    }

    @Transactional
    public TagDto updateTag(Long userId, Long tagId, TagRequestDto request) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found or access denied"));

        String normalizedName = request.getName() != null ? request.getName().trim().toLowerCase() : "";
        if (normalizedName.startsWith("#")) {
            normalizedName = normalizedName.substring(1).trim();
        }
        if (normalizedName.isBlank()) {
            throw new BadRequestException("Tag name cannot be empty");
        }
        if (normalizedName.length() > 50) {
            throw new BadRequestException("Tag name must be 50 characters or less");
        }

        Optional<Tag> existing = tagRepository.findByUserIdAndName(userId, normalizedName);
        if (existing.isPresent() && !existing.get().getId().equals(tagId)) {
            throw new BadRequestException("Tag with name '" + normalizedName + "' already exists");
        }

        tag.setName(normalizedName);
        if (request.getColor() != null) {
            tag.setColor(request.getColor());
        }

        Tag saved = tagRepository.save(tag);
        return new TagDto(saved.getId(), saved.getName(), saved.getColor());
    }

    @Transactional
    public void deleteTag(Long userId, Long tagId) {
        Tag tag = tagRepository.findByIdAndUserId(tagId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found or access denied"));
        tagRepository.delete(tag);
    }

    @Transactional
    public Set<Tag> processAndAssignTags(User user, DiaryEntry entry, List<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            entry.setTags(new HashSet<>());
            return entry.getTags();
        }

        // Validate max 10 tags per entry
        List<String> cleanedNames = tagNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .map(s -> s.startsWith("#") ? s.substring(1).trim() : s)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());

        if (cleanedNames.size() > 10) {
            throw new BadRequestException("An entry can have a maximum of 10 tags");
        }

        for (String name : cleanedNames) {
            if (name.length() > 50) {
                throw new BadRequestException("Tag name '" + name + "' exceeds maximum 50 characters");
            }
        }

        Set<Tag> assignedTags = new HashSet<>();
        for (String name : cleanedNames) {
            Tag tag = tagRepository.findByUserIdAndName(user.getId(), name)
                    .orElseGet(() -> tagRepository.save(new Tag(user, name, null)));
            assignedTags.add(tag);
        }

        entry.setTags(assignedTags);
        return assignedTags;
    }
}
