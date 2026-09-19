import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag as TagIcon, Plus, AlertCircle, X } from 'lucide-react';
import api from '../../api/axios';
import { Tag } from '../../types';

interface TagInputProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange, disabled, readOnly }) => {
  const isReadOnly = readOnly || disabled;
  const [inputValue, setInputValue] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Current tags list
  const currentTags = Array.isArray(tags) ? tags : [];
  const currentTagNames = currentTags.map((t) => (typeof t === 'string' ? t : t.name));

  useEffect(() => {
    const fetchUserTags = async () => {
      try {
        const res = await api.get<Tag[]>('/tags');
        setAvailableTags(res.data);
      } catch (err) {
        console.error('Failed to fetch user tags', err);
      }
    };
    fetchUserTags();
  }, []);

  const addTag = (tagName: string) => {
    setErrorMsg(null);
    let raw = tagName.trim().toLowerCase();
    if (!raw) return;

    // Split by spaces or commas in case user pasted or typed "#tag1 #tag2"
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    let updatedTags = [...currentTags];

    for (let part of parts) {
      if (part.startsWith('#')) part = part.substring(1).trim();
      if (!part) continue;

      if (part.length > 50) {
        setErrorMsg('Tag name must be 50 characters or less');
        continue;
      }

      const existingNames = updatedTags.map((t: Tag) => (typeof t === 'string' ? (t as string).toLowerCase() : t.name.toLowerCase()));
      if (existingNames.includes(part)) {
        continue;
      }

      if (updatedTags.length >= 10) {
        setErrorMsg('Maximum 10 tags per entry allowed');
        break;
      }

      const existingObj = availableTags.find((t) => t.name === part);
      const newTagObj: Tag = existingObj || { id: Date.now(), name: part, color: '#8B5CF6' };
      updatedTags.push(newTagObj);
    }

    onChange(updatedTags);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (nameToRemove: string) => {
    setErrorMsg(null);
    onChange(currentTags.filter((t) => (typeof t === 'string' ? t !== nameToRemove : t.name !== nameToRemove)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && currentTagNames.length > 0) {
      removeTag(currentTagNames[currentTagNames.length - 1]);
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
    setShowSuggestions(false);
  };

  const filteredSuggestions = availableTags.filter(
    (t) =>
      t.name.toLowerCase().includes(inputValue.trim().toLowerCase()) &&
      !currentTagNames.includes(t.name.toLowerCase())
  );

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 flex-wrap min-h-[36px] p-2 rounded-btn bg-surface-2/40 border border-border">
        <TagIcon className="w-3.5 h-3.5 text-muted shrink-0 ml-1" />

        {/* Animated Tag Chips */}
        <AnimatePresence>
          {currentTagNames.map((name) => {
            const tagObj = availableTags.find((t) => t.name === name);
            const color = tagObj?.color || 'var(--accent)';
            return (
              <motion.span
                key={name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface border border-border text-text shadow-sm"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>#{name}</span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeTag(name)}
                    className="text-muted hover:text-rose-500 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </motion.span>
            );
          })}
        </AnimatePresence>

        {/* Input for typing tags */}
        {!isReadOnly && currentTagNames.length < 10 && (
          <div className="relative flex-1 min-w-[120px]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                if (val.endsWith(' ') || val.endsWith(',')) {
                  addTag(val);
                } else {
                  setInputValue(val);
                  setShowSuggestions(true);
                }
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={currentTagNames.length === 0 ? "Add tags (e.g. #work, #ideas)..." : "Add tag..."}
              className="w-full bg-transparent text-xs text-text placeholder-muted focus:outline-none py-1"
            />

            {/* Autocomplete Dropdown */}
            {showSuggestions && inputValue.trim().length > 0 && filteredSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-surface border border-border rounded-btn shadow-xl py-1 z-30 max-h-40 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => addTag(suggestion.name)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-text hover:bg-surface-2 cursor-pointer"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: suggestion.color || 'var(--accent)' }}
                    />
                    <span>#{suggestion.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error / Max Limit Message */}
      {errorMsg && (
        <div className="text-[11px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
