import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface WritingModeContextType {
  isWriting: boolean;
  notifyWriting: () => void;
}

const WritingModeContext = createContext<WritingModeContextType | undefined>(undefined);

export const WritingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWriting, setIsWriting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notifyWriting = useCallback(() => {
    setIsWriting(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsWriting(false);
    }, 2000);
  }, []);

  return (
    <WritingModeContext.Provider value={{ isWriting, notifyWriting }}>
      {children}
    </WritingModeContext.Provider>
  );
};

export const useWritingMode = () => {
  const context = useContext(WritingModeContext);
  if (!context) {
    return {
      isWriting: false,
      notifyWriting: () => {},
    };
  }
  return context;
};
