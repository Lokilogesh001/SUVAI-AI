
import React, { createContext, useContext, useState, useEffect } from "react";

// Define available languages
export type Language = "en" | "ta" | "hi" | "ml";

export const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
];

type LanguageContextType = {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with browser language or default to English
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang === 'ta' || browserLang === 'hi' || browserLang === 'ml') 
      ? browserLang as Language 
      : 'en';
  };

  // Try to get language from localStorage or use browser language
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('language');
    return (savedLang === 'en' || savedLang === 'ta' || savedLang === 'hi' || savedLang === 'ml') 
      ? savedLang as Language 
      : getBrowserLanguage();
  });

  // Save language preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const setLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Translations will be loaded dynamically
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const langData = await import(`../translations/${currentLanguage}.json`);
        setTranslations(langData.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
        // Fallback to English if translations fail to load
        if (currentLanguage !== 'en') {
          const fallbackData = await import(`../translations/en.json`);
          setTranslations(fallbackData.default);
        }
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
