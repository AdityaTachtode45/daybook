package com.daybook.repository;

import com.daybook.model.MediaAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaAttachmentRepository extends JpaRepository<MediaAttachment, Long> {
    Optional<MediaAttachment> findByIdAndUserId(Long id, Long userId);
    List<MediaAttachment> findByEntryIdAndUserId(Long entryId, Long userId);
    void deleteByUserId(Long userId);

    @Query("SELECT m FROM MediaAttachment m JOIN FETCH m.entry e WHERE m.user.id = :userId ORDER BY e.entryDate DESC, m.createdAt DESC")
    List<MediaAttachment> findAllByUserIdOrderByEntryDateDesc(@Param("userId") Long userId);
}
