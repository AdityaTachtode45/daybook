package com.daybook.service;

import com.daybook.dto.TagDto;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.DiaryEntry;
import com.daybook.model.Tag;
import com.daybook.model.User;
import com.daybook.repository.TagRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    void testProcessAndAssignTags_Max10LimitEnforced() {
        User user = new User();
        user.setId(1L);
        DiaryEntry entry = new DiaryEntry(user, LocalDate.now());

        List<String> elevenTags = Arrays.asList("t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11");

        assertThrows(BadRequestException.class, () -> {
            tagService.processAndAssignTags(user, entry, elevenTags);
        });
    }

    @Test
    void testProcessAndAssignTags_ReplacesTagSetAndNormalizesNames() {
        User user = new User();
        user.setId(1L);
        DiaryEntry entry = new DiaryEntry(user, LocalDate.now());

        when(tagRepository.findByUserIdAndName(1L, "work")).thenReturn(Optional.of(new Tag(user, "work", "#123")));
        when(tagRepository.findByUserIdAndName(1L, "personal")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(i -> i.getArgument(0));

        Set<Tag> result = tagService.processAndAssignTags(user, entry, Arrays.asList(" Work ", "PERSONAL "));

        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(t -> t.getName().equals("work")));
        assertTrue(result.stream().anyMatch(t -> t.getName().equals("personal")));
    }

    @Test
    void testDeleteTag_UserIsolation() {
        Long userA = 1L;
        Long userB = 2L;
        Long tagId = 10L;

        when(tagRepository.findByIdAndUserId(tagId, userB)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            tagService.deleteTag(userB, tagId);
        });
    }
}
