package com.daybook.service;

import com.daybook.dto.*;
import com.daybook.model.DiaryEntry;
import com.daybook.model.MediaAttachment;
import com.daybook.model.MediaType;
import com.daybook.model.Mood;
import com.daybook.repository.DiaryEntryRepository;
import com.daybook.repository.TagRepository;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final DiaryEntryRepository entryRepository;
    private final TagRepository tagRepository;

    public SearchService(DiaryEntryRepository entryRepository, TagRepository tagRepository) {
        this.entryRepository = entryRepository;
        this.tagRepository = tagRepository;
    }

    public static String extractPlainText(String htmlContent) {
        if (htmlContent == null || htmlContent.isBlank()) {
            return "";
        }
        return Jsoup.parse(htmlContent).text();
    }

    @Transactional(readOnly = true)
    public SearchResponse searchEntries(
            Long userId,
            String query,
            List<String> tagNames,
            Mood mood,
            LocalDate fromDate,
            LocalDate toDate,
            Boolean hasVideo,
            Boolean hasPhoto,
            Boolean hasFile,
            int page,
            int size,
            String sort
    ) {
        int validatedSize = Math.min(Math.max(size, 1), 50);
        int validatedPage = Math.max(page, 0);

        List<DiaryEntry> allUserEntries = entryRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(
                userId,
                fromDate != null ? fromDate : LocalDate.of(1970, 1, 1),
                toDate != null ? toDate : LocalDate.of(2099, 12, 31)
        );

        List<String> cleanedTags = tagNames != null ? tagNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .map(s -> s.startsWith("#") ? s.substring(1).trim() : s)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList()) : Collections.emptyList();

        String rawQuery = query != null ? query.trim().toLowerCase() : "";
        String normalizedQuery = rawQuery.startsWith("#") ? rawQuery.substring(1).trim() : rawQuery;

        List<DiaryEntry> filtered = allUserEntries.stream().filter(entry -> {
            if (mood != null && entry.getMood() != mood) {
                return false;
            }

            if (!cleanedTags.isEmpty()) {
                Set<String> entryTagNames = entry.getTags().stream()
                        .map(t -> t.getName().toLowerCase())
                        .collect(Collectors.toSet());
                if (!entryTagNames.containsAll(cleanedTags)) {
                    return false;
                }
            }

            if (Boolean.TRUE.equals(hasVideo)) {
                boolean hasVid = entry.getAttachments().stream().anyMatch(a -> a.getType() == MediaType.VIDEO);
                if (!hasVid) return false;
            }
            if (Boolean.TRUE.equals(hasPhoto)) {
                boolean hasImg = entry.getAttachments().stream().anyMatch(a -> a.getType() == MediaType.IMAGE);
                if (!hasImg) return false;
            }
            if (Boolean.TRUE.equals(hasFile)) {
                boolean hasDoc = entry.getAttachments().stream().anyMatch(a -> a.getType() == MediaType.DOCUMENT || a.getType() == MediaType.OTHER);
                if (!hasDoc) return false;
            }

            if (!normalizedQuery.isBlank()) {
                String titleText = entry.getTitle() != null ? entry.getTitle().toLowerCase() : "";
                String bodyText = entry.getContentText() != null ? entry.getContentText().toLowerCase() : "";
                if (!titleText.contains(normalizedQuery) && !bodyText.contains(normalizedQuery)) {
                    return false;
                }
            }

            return true;
        }).collect(Collectors.toList());

        if ("oldest".equalsIgnoreCase(sort)) {
            filtered.sort(Comparator.comparing(DiaryEntry::getEntryDate));
        } else if ("relevance".equalsIgnoreCase(sort) && !normalizedQuery.isBlank()) {
            final String searchQuery = normalizedQuery;
            filtered.sort(new Comparator<DiaryEntry>() {
                @Override
                public int compare(DiaryEntry e1, DiaryEntry e2) {
                    int score1 = getSearchRelevanceScore(e1, searchQuery);
                    int score2 = getSearchRelevanceScore(e2, searchQuery);
                    return Integer.compare(score2, score1);
                }
            });
        } else {
            filtered.sort(Comparator.comparing(DiaryEntry::getEntryDate).reversed());
        }

        int totalElements = filtered.size();
        int totalPages = (int) Math.ceil((double) totalElements / validatedSize);
        int start = Math.min(validatedPage * validatedSize, totalElements);
        int end = Math.min(start + validatedSize, totalElements);

        List<DiaryEntry> pagedEntries = filtered.subList(start, end);

        List<SearchResultDto> content = pagedEntries.stream().map(e -> {
            String snippet = generateHighlightedSnippet(e.getTitle(), e.getContentText(), normalizedQuery);
            MediaCountsDto mediaCounts = computeMediaCounts(e.getAttachments());
            List<TagDto> tagDtos = e.getTags().stream()
                    .map(t -> new TagDto(t.getId(), t.getName(), t.getColor()))
                    .collect(Collectors.toList());

            return new SearchResultDto(
                    e.getEntryDate(),
                    e.getTitle(),
                    snippet,
                    e.getMood(),
                    tagDtos,
                    mediaCounts
            );
        }).collect(Collectors.toList());

        return new SearchResponse(content, validatedPage, validatedSize, totalElements, totalPages);
    }

    public static String generateHighlightedSnippet(String title, String plainText, String query) {
        String textToSearch = plainText != null ? plainText : "";
        if (textToSearch.isBlank()) {
            return title != null ? HtmlUtils.htmlEscape(title) : "";
        }

        if (query == null || query.isBlank()) {
            String escaped = HtmlUtils.htmlEscape(textToSearch);
            return escaped.length() > 160 ? escaped.substring(0, 160) + "..." : escaped;
        }

        String lowerText = textToSearch.toLowerCase();
        String lowerQuery = query.toLowerCase();
        int matchIndex = lowerText.indexOf(lowerQuery);

        if (matchIndex == -1) {
            String escaped = HtmlUtils.htmlEscape(textToSearch);
            return escaped.length() > 160 ? escaped.substring(0, 160) + "..." : escaped;
        }

        int snippetStart = Math.max(0, matchIndex - 60);
        int snippetEnd = Math.min(textToSearch.length(), matchIndex + query.length() + 100);

        String rawSnippet = textToSearch.substring(snippetStart, snippetEnd);
        String prefix = snippetStart > 0 ? "..." : "";
        String suffix = snippetEnd < textToSearch.length() ? "..." : "";

        String escapedSnippet = HtmlUtils.htmlEscape(rawSnippet);

        String escapedQuery = HtmlUtils.htmlEscape(query);
        Pattern pattern = Pattern.compile(Pattern.quote(escapedQuery), Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(escapedSnippet);
        String highlighted = matcher.replaceAll("<mark>$0</mark>");

        return prefix + highlighted + suffix;
    }

    private static int getSearchRelevanceScore(DiaryEntry entry, String query) {
        int score = 0;
        if (entry.getTitle() != null && entry.getTitle().toLowerCase().contains(query)) {
            score += 10;
        }
        if (entry.getContentText() != null) {
            String text = entry.getContentText().toLowerCase();
            int count = 0;
            int idx = 0;
            while ((idx = text.indexOf(query, idx)) != -1) {
                count++;
                idx += query.length();
            }
            score += count;
        }
        return score;
    }

    private MediaCountsDto computeMediaCounts(List<MediaAttachment> attachments) {
        int videos = 0;
        int photos = 0;
        int files = 0;
        for (MediaAttachment att : attachments) {
            if (att.getType() == MediaType.VIDEO) videos++;
            else if (att.getType() == MediaType.IMAGE) photos++;
            else files++;
        }
        return new MediaCountsDto(videos, photos, files);
    }
}
