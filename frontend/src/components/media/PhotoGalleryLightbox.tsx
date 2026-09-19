import React, { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { Image as ImageIcon, Trash2, Maximize2 } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface PhotoGalleryLightboxProps {
  photos: MediaAttachment[];
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

export const PhotoGalleryLightbox: React.FC<PhotoGalleryLightboxProps> = ({ photos, onDelete, readOnly }) => {
  const [index, setIndex] = useState<number>(-1);

  if (photos.length === 0) return null;

  const slides = photos.map((p) => ({ src: p.url }));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
        <ImageIcon className="w-4 h-4 text-accent" />
        <span>Photos ({photos.length})</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-card overflow-hidden journal-card hover:border-accent transition-all duration-200"
          >
            <img
              src={photo.url}
              alt={photo.fileName || 'Photo'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Hover overlay controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setIndex(idx)}
                className="p-2 rounded-btn bg-surface/80 text-text hover:bg-surface transition-colors"
                title="Expand Photo"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              {!readOnly && (
                <button
                  onClick={() => onDelete(photo.id)}
                  className="p-2 rounded-btn bg-rose-500/80 text-white hover:bg-rose-500 transition-colors"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Yet Another React Lightbox Modal */}
      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
      />
    </div>
  );
};
