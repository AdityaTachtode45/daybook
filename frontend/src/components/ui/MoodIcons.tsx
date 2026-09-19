import React from 'react';
import { MoodType } from '../../types';

interface MoodIconProps {
  mood: MoodType;
  className?: string;
  size?: number;
}

export const MoodIcon: React.FC<MoodIconProps> = ({ mood, className = '', size = 24 }) => {
  switch (mood) {
    case 'GREAT':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8.5 9.5L9.5 8.5L8.5 7.5L7.5 8.5L8.5 9.5Z" fill="currentColor" />
          <path d="M15.5 9.5L16.5 8.5L15.5 7.5L14.5 8.5L15.5 9.5Z" fill="currentColor" />
        </svg>
      );
    case 'GOOD':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M8 14C9 16 11 16.5 12 16.5C13 16.5 15 16 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1.2" fill="currentColor" />
          <circle cx="15" cy="9" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'OKAY':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M8.5 15H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="9.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'LOW':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16C15 14.5 13 14 12 14C11 14 9 14.5 8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="9.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="9.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case 'BAD':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path d="M16 16.5C14.5 14.5 13.5 14.5 12 14.5C10.5 14.5 9.5 14.5 8 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7.5 9L10.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16.5 9L13.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};
