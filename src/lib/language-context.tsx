"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, adminTranslations } from "./types"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof adminTranslations.FR
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("FR")
  
  const t = adminTranslations[language]
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
