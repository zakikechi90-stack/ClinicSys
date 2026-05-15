"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, doctorTranslations } from "./types"

interface ChefLanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof doctorTranslations.FR
  isMedecinChef: boolean
}

const ChefLanguageContext = createContext<ChefLanguageContextType | undefined>(undefined)

export function ChefLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("FR")
  const isMedecinChef = true // Always true for Médecin Chef
  
  const t = doctorTranslations[language]
  
  return (
    <ChefLanguageContext.Provider value={{ language, setLanguage, t, isMedecinChef }}>
      {children}
    </ChefLanguageContext.Provider>
  )
}

export function useChefLanguage() {
  const context = useContext(ChefLanguageContext)
  if (!context) {
    throw new Error("useChefLanguage must be used within a ChefLanguageProvider")
  }
  return context
}
