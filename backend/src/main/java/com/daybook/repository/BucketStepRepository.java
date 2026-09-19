package com.daybook.repository;

import com.daybook.model.BucketStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BucketStepRepository extends JpaRepository<BucketStep, Long> {

    Optional<BucketStep> findByIdAndUserId(Long id, Long userId);

    List<BucketStep> findByItemIdOrderBySortOrderAscIdAsc(Long itemId);

    long countByItemId(Long itemId);

    @Query("SELECT MAX(s.sortOrder) FROM BucketStep s WHERE s.item.id = :itemId")
    Integer findMaxSortOrderByItemId(@Param("itemId") Long itemId);

    void deleteByUserId(Long userId);
}
