package com.daybook.dto;

public class StreakDto {
    private int currentStreak;
    private int longestStreak;
    private long totalEntries;
    private long entriesThisMonth;
    private boolean wroteToday;

    public StreakDto() {
    }

    public StreakDto(int currentStreak, int longestStreak, long totalEntries, long entriesThisMonth, boolean wroteToday) {
        this.currentStreak = currentStreak;
        this.longestStreak = longestStreak;
        this.totalEntries = totalEntries;
        this.entriesThisMonth = entriesThisMonth;
        this.wroteToday = wroteToday;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public long getTotalEntries() {
        return totalEntries;
    }

    public void setTotalEntries(long totalEntries) {
        this.totalEntries = totalEntries;
    }

    public long getEntriesThisMonth() {
        return entriesThisMonth;
    }

    public void setEntriesThisMonth(long entriesThisMonth) {
        this.entriesThisMonth = entriesThisMonth;
    }

    public boolean isWroteToday() {
        return wroteToday;
    }

    public void setWroteToday(boolean wroteToday) {
        this.wroteToday = wroteToday;
    }
}
