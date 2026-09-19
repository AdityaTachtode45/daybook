import React, { useState } from 'react';
import { Video, Trash2, Play } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface VideoListProps {
  videos: MediaAttachment[];
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

export const VideoList: React.FC<VideoListProps> = ({ videos, onDelete, readOnly }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (videos.length === 0) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Video className="w-4 h-4 text-accent-violet" />
        <span>Videos ({videos.length})</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="group glass-card rounded-2xl overflow-hidden border border-white/10 relative flex flex-col justify-between"
          >
            {/* Inline Player */}
            <div className="relative aspect-video bg-black/60 overflow-hidden">
              <video
                src={vid.url}
                controls
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Footer info */}
            <div className="p-3 flex items-center justify-between bg-surface-muted/60 text-xs">
              <div className="truncate pr-2">
                <p className="text-gray-200 font-medium truncate">{vid.fileName || 'Video attachment'}</p>
                <p className="text-gray-400 text-[10px]">{formatFileSize(vid.sizeBytes)}</p>
              </div>

              {!readOnly && (
                <button
                  onClick={() => onDelete(vid.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
