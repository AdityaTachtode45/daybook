package com.daybook.service;

import com.daybook.model.DiaryEntry;
import com.daybook.repository.DiaryEntryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class BackfillRunner implements CommandLineRunner {

    private final DiaryEntryRepository entryRepository;

    public BackfillRunner(DiaryEntryRepository entryRepository) {
        this.entryRepository = entryRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<DiaryEntry> entries = entryRepository.findAll();
        boolean updated = false;

        for (DiaryEntry entry : entries) {
            if (entry.getContentText() == null && entry.getContent() != null) {
                String plainText = SearchService.extractPlainText(entry.getContent());
                entry.setContentText(plainText);
                entryRepository.save(entry);
                updated = true;
            }
        }

        if (updated) {
            System.out.println("[Daybook] Successfully backfilled content_text for pre-existing diary entries.");
        }
    }
}
