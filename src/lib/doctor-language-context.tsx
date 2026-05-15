"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { type Language, doctorTranslations } from "./types"

interface DoctorLanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof doctorTranslations.FR
  isMedecinChef: boolean
  setIsMedecinChef: (value: boolean) => void
}

const DoctorLanguageContext = createContext<DoctorLanguageContextType | undefined>(undefined)

export function DoctorLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("FR")
  const [isMedecinChef, setIsMedecinChef] = useState(false) // Default to false for normal doctor
  
  const t = doctorTranslations[language]
  
  return (
    <DoctorLanguageContext.Provider value={{ language, setLanguage, t, isMedecinChef, setIsMedecinChef }}>
      {children}
    </DoctorLanguageContext.Provider>
  )
}

export function useDoctorLanguage() {
  const context = useContext(DoctorLanguageContext)
  if (!context) {
    throw new Error("useDoctorLanguage must be used within a DoctorLanguageProvider")
  }
  return context
}
