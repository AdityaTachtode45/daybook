import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Maximize2, X } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface PhotoGalleryProps {
  photos: MediaAttachment[];
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onDelete, readOnly }) => {
  const [activePhoto, setActivePhoto] = useState<MediaAttachment | null>(null);

  if (photos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <ImageIcon className="w-4 h-4 text-accent-indigo" />
        <span>Photos ({photos.length})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-2xl overflow-hidden glass-card border border-white/10 hover:border-accent-violet/50 transition-all duration-200"
          >
            <img
              src={photo.url}
              alt={photo.fileName || 'Photo attachment'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setActivePhoto(photo)}
                className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors"
                title="View Photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {!readOnly && (
                <button
                  onClick={() => onDelete(photo.id)}
                  className="p-2 rounded-xl bg-red-500/30 text-red-300 hover:bg-red-500/50 backdrop-blur-md transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={activePhoto.url}
              alt={activePhoto.fileName || 'Enlarged photo'}
              className="w-full h-full object-contain max-h-[80vh]"
            />
            {activePhoto.fileName && (
              <p className="text-center text-xs text-gray-400 mt-2">{activePhoto.fileName}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
