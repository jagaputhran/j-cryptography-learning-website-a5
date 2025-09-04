"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface ProgressContextType {
  currentSection: string
  completedSections: string[]
  totalProgress: number
  completeSection: (sectionId: string) => void
  setCurrentSection: (sectionId: string) => void
  earnBadge: (badgeId: string) => void
  earnedBadges: string[]
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [currentSection, setCurrentSection] = useState("intro")
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  const totalSections = 6
  const totalProgress = Math.round((completedSections.length / totalSections) * 100)

  const completeSection = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections((prev) => [...prev, sectionId])
    }
  }

  const earnBadge = (badgeId: string) => {
    if (!earnedBadges.includes(badgeId)) {
      setEarnedBadges((prev) => [...prev, badgeId])
    }
  }

  return (
    <ProgressContext.Provider
      value={{
        currentSection,
        completedSections,
        totalProgress,
        completeSection,
        setCurrentSection,
        earnBadge,
        earnedBadges,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider")
  }
  return context
}
