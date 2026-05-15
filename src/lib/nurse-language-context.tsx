"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, nurseTranslations } from "./types"

interface NurseLanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof nurseTranslations.FR
}

const NurseLanguageContext = createContext<NurseLanguageContextType | undefined>(undefined)

export function NurseLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("FR")

  const t = nurseTranslations[language]

  return (
    <NurseLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </NurseLanguageContext.Provider>
  )
}

export function useNurseLanguage() {
  const context = useContext(NurseLanguageContext)
  if (!context) {
    throw new Error("useNurseLanguage must be used within a NurseLanguageProvider")
  }
  return context
}
