package com.daybook.service;

import com.daybook.dto.SearchResponse;
import com.daybook.model.DiaryEntry;
import com.daybook.model.Mood;
import com.daybook.model.Tag;
import com.daybook.model.User;
import com.daybook.repository.DiaryEntryRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SearchServiceTest {

    @Mock
    private DiaryEntryRepository entryRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private SearchService searchService;

    @Test
    void testGenerateHighlightedSnippet_XSSPrevention() {
        String title = "Malicious Code";
        String contentText = "Here is a <script>alert('XSS')</script> test keyword in the body.";
        String query = "keyword";

        String snippet = SearchService.generateHighlightedSnippet(title, contentText, query);

        // Check that script tags are escaped to &lt;script&gt; and keyword is wrapped in <mark>
        assertTrue(snippet.contains("&lt;script&gt;"));
        assertTrue(snippet.contains("<mark>keyword</mark>"));
        assertFalse(snippet.contains("<script>alert"));
    }

    @Test
    void testSearchEntries_CombinedTagAndMoodFilter() {
        Long userId = 1L;
        User user = new User();
        user.setId(userId);

        Tag workTag = new Tag(user, "work", null);

        DiaryEntry entry1 = new DiaryEntry(user, LocalDate.of(2026, 9, 19));
        entry1.setTitle("Work Project");
        entry1.setContentText("Finished the backend work");
        entry1.setMood(Mood.GREAT);
        entry1.getTags().add(workTag);

        DiaryEntry entry2 = new DiaryEntry(user, LocalDate.of(2026, 9, 18));
        entry2.setTitle("Personal Day");
        entry2.setContentText("Had fun resting");
        entry2.setMood(Mood.LOW);

        when(entryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(eq(userId), any(), any()))
                .thenReturn(Arrays.asList(entry1, entry2));

        SearchResponse response = searchService.searchEntries(
                userId,
                "work",
                Collections.singletonList("work"),
                Mood.GREAT,
                null, null, null, null, null,
                0, 20, "newest"
        );

        assertEquals(1, response.getTotalElements());
        assertEquals("Work Project", response.getContent().get(0).getTitle());
    }

    @Test
    void testSearchEntries_UserIsolation() {
        Long userA = 1L;
        Long userB = 2L;

        User userAEntity = new User();
        userAEntity.setId(userA);
        DiaryEntry entryA = new DiaryEntry(userAEntity, LocalDate.now());
        entryA.setTitle("User A Private Note");

        when(entryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(eq(userB), any(), any()))
                .thenReturn(Collections.emptyList());

        SearchResponse responseUserB = searchService.searchEntries(
                userB, "Private", null, null, null, null, null, null, null, 0, 20, "newest"
        );

        assertEquals(0, responseUserB.getTotalElements());
    }
}
