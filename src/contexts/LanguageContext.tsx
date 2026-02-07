import React, { createContext, useContext, useState, useCallback } from "react";
import { translations, Language } from "@/i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: Record<string, any>, path: string): string {
  const keys = path.split(".");
  let current: any = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => getNestedValue(translations[language] as any, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
