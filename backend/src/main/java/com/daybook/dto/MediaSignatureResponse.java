package com.daybook.dto;

public class MediaSignatureResponse {
    private String signature;
    private long timestamp;
    private String apiKey;
    private String cloudName;
    private String folder;
    private String uploadPreset;

    public MediaSignatureResponse() {
    }

    public MediaSignatureResponse(String signature, long timestamp, String apiKey, String cloudName, String folder, String uploadPreset) {
        this.signature = signature;
        this.timestamp = timestamp;
        this.apiKey = apiKey;
        this.cloudName = cloudName;
        this.folder = folder;
        this.uploadPreset = uploadPreset;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getCloudName() {
        return cloudName;
    }

    public void setCloudName(String cloudName) {
        this.cloudName = cloudName;
    }

    public String getFolder() {
        return folder;
    }

    public void setFolder(String folder) {
        this.folder = folder;
    }

    public String getUploadPreset() {
        return uploadPreset;
    }

    public void setUploadPreset(String uploadPreset) {
        this.uploadPreset = uploadPreset;
    }
}
