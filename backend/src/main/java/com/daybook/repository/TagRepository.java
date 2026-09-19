package com.daybook.repository;

import com.daybook.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findByUserIdAndName(Long userId, String name);

    List<Tag> findByUserId(Long userId);

    List<Tag> findByUserIdAndNameIn(Long userId, Set<String> names);

    @Query("SELECT t, COUNT(e) AS usageCount FROM Tag t LEFT JOIN t.user u LEFT JOIN DiaryEntry e JOIN e.tags et WHERE t.user.id = :userId AND et.id = t.id GROUP BY t ORDER BY COUNT(e) DESC, t.name ASC")
    List<Object[]> findTagsWithUsageCountByUserIdRaw(@Param("userId") Long userId);

    Optional<Tag> findByIdAndUserId(Long id, Long userId);

    void deleteByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);
}
