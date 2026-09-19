import React from 'react';
import { FileText, Download, ExternalLink, Trash2, FileCode, FileArchive } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface DocumentListProps {
  documents: MediaAttachment[];
  onDelete: (id: number) => void;
  readOnly?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, readOnly }) => {
  if (documents.length === 0) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getDocIcon = (mimeType?: string, fileName?: string) => {
    if (mimeType?.includes('zip') || fileName?.endsWith('.zip')) return FileArchive;
    if (mimeType?.includes('code') || fileName?.endsWith('.json')) return FileCode;
    return FileText;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <FileText className="w-4 h-4 text-cyan-400" />
        <span>Documents & Files ({documents.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {documents.map((doc) => {
          const Icon = getDocIcon(doc.mimeType, doc.fileName);
          return (
            <div
              key={doc.id}
              className="glass-card p-3.5 rounded-2xl border border-white/10 flex items-center justify-between hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-200 truncate">{doc.fileName || 'Document'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatFileSize(doc.sizeBytes)}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Open / Download File"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {!readOnly && (
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
