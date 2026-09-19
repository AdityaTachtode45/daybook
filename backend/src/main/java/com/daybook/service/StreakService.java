package com.daybook.service;

import com.daybook.dto.StreakDto;
import com.daybook.model.Profile;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;

@Service
public class StreakService {

    private final DiaryEntryRepository entryRepository;
    private final ProfileRepository profileRepository;

    public StreakService(DiaryEntryRepository entryRepository, ProfileRepository profileRepository) {
        this.entryRepository = entryRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public StreakDto calculateStreaks(Long userId) {
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
        LocalDate yesterday = today.minusDays(1);

        List<LocalDate> dates = entryRepository.findDistinctValidEntryDatesByUserId(userId);

        boolean wroteToday = dates.contains(today);

        int currentStreak = 0;
        if (!dates.isEmpty()) {
            LocalDate streakStart = null;
            if (dates.contains(today)) {
                streakStart = today;
            } else if (dates.contains(yesterday)) {
                streakStart = yesterday;
            }

            if (streakStart != null) {
                LocalDate checkDate = streakStart;
                for (LocalDate date : dates) {
                    if (date.isAfter(streakStart)) {
                        continue;
                    }
                    if (date.equals(checkDate)) {
                        currentStreak++;
                        checkDate = checkDate.minusDays(1);
                    } else if (date.isBefore(checkDate)) {
                        break;
                    }
                }
            }
        }

        // Longest streak computation
        int longestStreak = 0;
        if (!dates.isEmpty()) {
            int currentRun = 0;
            LocalDate prevDate = null;
            for (LocalDate date : dates) {
                if (prevDate == null) {
                    currentRun = 1;
                } else if (prevDate.minusDays(1).equals(date)) {
                    currentRun++;
                } else {
                    currentRun = 1;
                }
                if (currentRun > longestStreak) {
                    longestStreak = currentRun;
                }
                prevDate = date;
            }
        }

        long totalEntries = dates.size();

        YearMonth currentYearMonth = YearMonth.from(today);
        LocalDate firstOfMonth = currentYearMonth.atDay(1);
        LocalDate lastOfMonth = currentYearMonth.atEndOfMonth();

        long entriesThisMonth = entryRepository.countValidEntriesInDateRange(userId, firstOfMonth, lastOfMonth);

        return new StreakDto(currentStreak, longestStreak, totalEntries, entriesThisMonth, wroteToday);
    }
}
