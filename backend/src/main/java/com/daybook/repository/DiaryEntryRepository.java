package com.daybook.repository;

import com.daybook.model.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, Long> {

    Optional<DiaryEntry> findByUserIdAndEntryDate(Long userId, LocalDate entryDate);

    List<DiaryEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(Long userId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT DISTINCT e.entryDate FROM DiaryEntry e WHERE e.user.id = :userId AND ((e.content IS NOT NULL AND TRIM(e.content) != '') OR SIZE(e.attachments) > 0) ORDER BY e.entryDate DESC")
    List<LocalDate> findDistinctValidEntryDatesByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(e) FROM DiaryEntry e WHERE e.user.id = :userId AND e.entryDate BETWEEN :startDate AND :endDate AND ((e.content IS NOT NULL AND TRIM(e.content) != '') OR SIZE(e.attachments) > 0)")
    long countValidEntriesInDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    void deleteByUserIdAndEntryDate(Long userId, LocalDate entryDate);

    void deleteByUserId(Long userId);
}
