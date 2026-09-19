import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag as TagIcon, X } from 'lucide-react';
import { Tag } from '../../types';

interface TagChipsProps {
  tags: Tag[] | string[] | Tag | string;
  onRemoveTag?: (tagName: string) => void;
  clickable?: boolean;
  size?: 'sm' | 'md';
}

export const TagChips: React.FC<TagChipsProps> = ({
  tags,
  onRemoveTag,
  clickable = true,
  size = 'md',
}) => {
  const navigate = useNavigate();

  const tagList = Array.isArray(tags) ? tags : tags ? [tags] : [];
  if (tagList.length === 0) return null;

  const handleChipClick = (e: React.MouseEvent, tagName: string) => {
    e.stopPropagation();
    if (clickable) {
      navigate(`/search?tags=${encodeURIComponent(tagName)}`);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tagList.map((tagItem) => {
        const name = typeof tagItem === 'string' ? tagItem : tagItem.name;
        const color = typeof tagItem === 'object' && tagItem.color ? tagItem.color : undefined;

        return (
          <span
            key={name}
            onClick={(e) => handleChipClick(e, name)}
            className={`inline-flex items-center gap-1.5 rounded-full border transition-all duration-200 ${
              clickable ? 'cursor-pointer hover:border-accent hover:text-accent' : ''
            } ${
              size === 'sm'
                ? 'px-2 py-0.5 text-[10px] bg-surface-2/60 border-border text-muted'
                : 'px-2.5 py-1 text-xs font-medium bg-surface-2 border-border text-text'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: color || 'var(--accent)' }}
            />
            <span>#{name}</span>

            {onRemoveTag && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(name);
                }}
                className="text-muted hover:text-rose-500 rounded-full p-0.5 transition-colors"
                title="Remove tag"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
};
