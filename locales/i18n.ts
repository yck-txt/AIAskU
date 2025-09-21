import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import en from './en';
import de from './de';

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define translations object
const translations: { [key: string]: { [key: string]: string } } = { en, de };

// Provider component
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(localStorage.getItem('language') || 'de');

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['de']?.[key] || key;
  };

  // FIX: Replaced JSX with React.createElement to resolve parsing errors in a .ts file.
  // JSX requires a .tsx file extension, so using React.createElement is the correct
  // alternative when the file cannot be renamed.
  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

// Custom hook to use the translation context
export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
