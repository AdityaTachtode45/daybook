package com.daybook.service;

import com.daybook.dto.EntryResponseDto;

import com.daybook.exception.ResourceNotFoundException;
import com.daybook.model.DiaryEntry;
import com.daybook.model.User;
import com.daybook.repository.DiaryEntryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserDataIsolationTest {

    @Mock
    private DiaryEntryRepository entryRepository;

    @InjectMocks
    private EntryService entryService;

    @Test
    void testGetEntryByDate_UserCannotAccessOtherUsersEntry() {
        Long userA = 1L;
        Long userB = 2L;
        LocalDate date = LocalDate.now();

        // Entry exists for user A
        User userAEntity = new User();
        userAEntity.setId(userA);
        DiaryEntry entryA = new DiaryEntry(userAEntity, date);

        when(entryRepository.findByUserIdAndEntryDate(userA, date)).thenReturn(Optional.of(entryA));
        when(entryRepository.findByUserIdAndEntryDate(userB, date)).thenReturn(Optional.empty());

        // User A can access
        EntryResponseDto dto = entryService.getEntryByDate(userA, date);

        // User B requesting same date gets ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> {
            entryService.getEntryByDate(userB, date);
        });
    }
}
