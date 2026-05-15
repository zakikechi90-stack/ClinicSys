"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, receptionTranslations } from "./types"

interface ReceptionLanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof receptionTranslations.FR
}

const ReceptionLanguageContext = createContext<ReceptionLanguageContextType | undefined>(undefined)

export function ReceptionLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("FR")

  const t = receptionTranslations[language]

  return (
    <ReceptionLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </ReceptionLanguageContext.Provider>
  )
}

export function useReceptionLanguage() {
  const context = useContext(ReceptionLanguageContext)
  if (!context) {
    throw new Error("useReceptionLanguage must be used within a ReceptionLanguageProvider")
  }
  return context
}
