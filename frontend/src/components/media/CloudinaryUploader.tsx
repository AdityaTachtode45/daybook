import React, { useState, useRef } from 'react';
import axios from 'axios';
import api from '../../api/axios';
import { UploadCloud, FileVideo, Image as ImageIcon, FileText, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { MediaAttachment, MediaSignature, MediaType } from '../../types';

interface CloudinaryUploaderProps {
  entryDate: string;
  onUploadSuccess: (attachment: MediaAttachment) => void;
  disabled?: boolean;
}

export const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  entryDate,
  onUploadSuccess,
  disabled,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getMediaType = (file: File): MediaType => {
    if (file.type.startsWith('video/')) return 'VIDEO';
    if (file.type.startsWith('image/')) return 'IMAGE';
    if (
      file.type.includes('pdf') ||
      file.type.includes('document') ||
      file.type.includes('word') ||
      file.type.includes('text') ||
      file.type.includes('zip')
    ) {
      return 'DOCUMENT';
    }
    return 'OTHER';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaType = getMediaType(file);

    // Validate size limits
    if (mediaType === 'VIDEO' && file.size > 500 * 1024 * 1024) {
      setError('Video file exceeds maximum limit of 500 MB');
      return;
    }
    if (mediaType === 'IMAGE' && file.size > 25 * 1024 * 1024) {
      setError('Image file exceeds maximum limit of 25 MB');
      return;
    }
    if (mediaType === 'DOCUMENT' && file.size > 50 * 1024 * 1024) {
      setError('Document file exceeds maximum limit of 50 MB');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request signed upload params from backend
      const resourceTypeParam = mediaType === 'VIDEO' ? 'video' : mediaType === 'IMAGE' ? 'image' : 'raw';
      const sigRes = await api.get<MediaSignature>(`/media/signature?type=${resourceTypeParam}`);
      const sigData = sigRes.data;

      // Step 2: Directly upload to Cloudinary signed endpoint
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceTypeParam}/upload`;

      const uploadRes = await axios.post(cloudinaryUrl, formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percent);
          }
        },
      });

      const cloudinaryData = uploadRes.data;

      // Step 3: Save metadata in backend
      const attachmentRes = await api.post<MediaAttachment>(`/entries/${entryDate}/media`, {
        url: cloudinaryData.secure_url,
        publicId: cloudinaryData.public_id,
        resourceType: resourceTypeParam,
        type: mediaType,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      onUploadSuccess(attachmentRes.data);
    } catch (err: any) {
      console.error('Upload failed', err);
      setError(err?.response?.data?.message || err?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          disabled || isUploading
            ? 'opacity-50 border-gray-700 bg-surface-muted/30 cursor-not-allowed'
            : 'border-white/10 hover:border-accent-violet/50 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="p-3 rounded-2xl bg-accent-violet/10 text-accent-violet">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Click or drag & drop files to upload</p>
            <p className="text-xs text-gray-400 mt-1">
              Supports Videos (up to 500MB), Photos (25MB), and Documents/PDFs (50MB)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mt-4 p-4 rounded-xl glass-card border border-accent-violet/30">
          <div className="flex items-center justify-between text-xs text-gray-300 mb-2 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-violet animate-ping" />
              Uploading to Cloudinary...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-gradient rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
