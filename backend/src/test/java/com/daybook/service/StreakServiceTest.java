package com.daybook.service;

import com.daybook.dto.StreakDto;
import com.daybook.model.Profile;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class StreakServiceTest {

    @Mock
    private DiaryEntryRepository entryRepository;

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private StreakService streakService;

    private Long userId = 1L;

    @BeforeEach
    void setUp() {
        Profile profile = new Profile();
        profile.setTimezone("UTC");
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profile));
    }

    @Test
    void testCalculateStreaks_NoEntries() {
        when(entryRepository.findDistinctValidEntryDatesByUserId(userId)).thenReturn(Collections.emptyList());
        when(entryRepository.countValidEntriesInDateRange(eq(userId), any(), any())).thenReturn(0L);

        StreakDto result = streakService.calculateStreaks(userId);

        assertEquals(0, result.getCurrentStreak());
        assertEquals(0, result.getLongestStreak());
        assertEquals(0, result.getTotalEntries());
        assertFalse(result.isWroteToday());
    }

    @Test
    void testCalculateStreaks_TodayOnly() {
        LocalDate today = LocalDate.now();
        when(entryRepository.findDistinctValidEntryDatesByUserId(userId)).thenReturn(Collections.singletonList(today));
        when(entryRepository.countValidEntriesInDateRange(eq(userId), any(), any())).thenReturn(1L);

        StreakDto result = streakService.calculateStreaks(userId);

        assertEquals(1, result.getCurrentStreak());
        assertEquals(1, result.getLongestStreak());
        assertEquals(1, result.getTotalEntries());
        assertTrue(result.isWroteToday());
    }

    @Test
    void testCalculateStreaks_ConsecutiveDaysEndingToday() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate dayBefore = today.minusDays(2);

        when(entryRepository.findDistinctValidEntryDatesByUserId(userId)).thenReturn(Arrays.asList(today, yesterday, dayBefore));
        when(entryRepository.countValidEntriesInDateRange(eq(userId), any(), any())).thenReturn(3L);

        StreakDto result = streakService.calculateStreaks(userId);

        assertEquals(3, result.getCurrentStreak());
        assertEquals(3, result.getLongestStreak());
        assertEquals(3, result.getTotalEntries());
        assertTrue(result.isWroteToday());
    }

    @Test
    void testCalculateStreaks_YesterdayOnly_StreakAlive() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate dayBefore = today.minusDays(2);

        when(entryRepository.findDistinctValidEntryDatesByUserId(userId)).thenReturn(Arrays.asList(yesterday, dayBefore));
        when(entryRepository.countValidEntriesInDateRange(eq(userId), any(), any())).thenReturn(2L);

        StreakDto result = streakService.calculateStreaks(userId);

        assertEquals(2, result.getCurrentStreak());
        assertEquals(2, result.getLongestStreak());
        assertFalse(result.isWroteToday());
    }

    @Test
    void testCalculateStreaks_GapBreaksStreak() {
        LocalDate today = LocalDate.now();
        LocalDate threeDaysAgo = today.minusDays(3);

        when(entryRepository.findDistinctValidEntryDatesByUserId(userId)).thenReturn(Collections.singletonList(threeDaysAgo));
        when(entryRepository.countValidEntriesInDateRange(eq(userId), any(), any())).thenReturn(0L);

        StreakDto result = streakService.calculateStreaks(userId);

        assertEquals(0, result.getCurrentStreak());
        assertEquals(1, result.getLongestStreak());
        assertFalse(result.isWroteToday());
    }
}
