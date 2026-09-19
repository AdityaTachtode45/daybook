package com.daybook.repository;

import com.daybook.model.BucketCategory;
import com.daybook.model.BucketItem;
import com.daybook.model.BucketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BucketItemRepository extends JpaRepository<BucketItem, Long> {

    List<BucketItem> findByUserId(Long userId);

    Optional<BucketItem> findByIdAndUserId(Long id, Long userId);

    List<BucketItem> findByUserIdAndCompletedDate(Long userId, LocalDate completedDate);

    List<BucketItem> findByUserIdAndCompletedDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, BucketStatus status);

    long countByUserIdAndStatusAndCompletedDateBetween(Long userId, BucketStatus status, LocalDate startDate, LocalDate endDate);

    @Query("SELECT b FROM BucketItem b WHERE b.user.id = :userId " +
           "AND (:status IS NULL OR b.status = :status) " +
           "AND (:category IS NULL OR b.category = :category) " +
           "AND (:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<BucketItem> searchItems(
            @Param("userId") Long userId,
            @Param("status") BucketStatus status,
            @Param("category") BucketCategory category,
            @Param("query") String query
    );

    @Query("SELECT b.completedDate AS completedDate, COUNT(b) AS count FROM BucketItem b " +
           "WHERE b.user.id = :userId AND b.completedDate IS NOT NULL AND b.completedDate BETWEEN :startDate AND :endDate " +
           "GROUP BY b.completedDate ORDER BY b.completedDate ASC")
    List<Object[]> countCompletedByDateGrouped(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT MAX(b.sortOrder) FROM BucketItem b WHERE b.user.id = :userId AND b.status = :status")
    Integer findMaxSortOrderByUserIdAndStatus(@Param("userId") Long userId, @Param("status") BucketStatus status);

    void deleteByUserId(Long userId);
}
