"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Lock, Shield, Key, Zap, Award, BookOpen, Users, Target } from "lucide-react"
import Link from "next/link"

interface Section {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  locked: boolean
}

export default function CryptoLearningHome() {
  const [currentProgress, setCurrentProgress] = useState(0)
  const [earnedBadges, setEarnedBadges] = useState<string[]>([])

  const sections: Section[] = [
    {
      id: "intro",
      title: "Alice & Bob's Story",
      description: "Meet our heroes and learn why cryptography matters",
      icon: <Users className="w-6 h-6" />,
      completed: false,
      locked: false,
    },
    {
      id: "diffie-hellman",
      title: "Diffie-Hellman Key Exchange",
      description: "Share secrets without sharing secrets",
      icon: <Key className="w-6 h-6" />,
      completed: false,
      locked: true,
    },
    {
      id: "rsa",
      title: "RSA Secret Box Game",
      description: "Public locks, private keys, and mathematical magic",
      icon: <Lock className="w-6 h-6" />,
      completed: false,
      locked: true,
    },
    {
      id: "ecc",
      title: "ECC Trampoline Adventure",
      description: "Bouncing on elliptic curves for security",
      icon: <Target className="w-6 h-6" />,
      completed: false,
      locked: true,
    },
    {
      id: "aes",
      title: "AES Rubik's Cube",
      description: "Scrambling and unscrambling data",
      icon: <Shield className="w-6 h-6" />,
      completed: false,
      locked: true,
    },
    {
      id: "signatures",
      title: "Digital Signatures & Post-Quantum Crypto",
      description: "Wax seals, quantum threats, and future-proof cryptography",
      icon: <Zap className="w-6 h-6" />,
      completed: false,
      locked: true,
    },
  ]

  const badges = [
    { id: "beginner", name: "Crypto Beginner", icon: "🔰" },
    { id: "key-master", name: "Key Master", icon: "🗝️" },
    { id: "code-breaker", name: "Code Breaker", icon: "🔓" },
    { id: "crypto-master", name: "Crypto Master", icon: "👑" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CryptoQuest</h1>
                <p className="text-sm text-muted-foreground">Learn cryptography through adventure</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Progress</p>
                <p className="text-xs text-muted-foreground">{currentProgress}% Complete</p>
              </div>
              <Progress value={currentProgress} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Master the Art of <span className="text-primary">Secret Communication</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 text-pretty">
              Join Alice and Bob on an interactive journey through the fascinating world of cryptography. Learn through
              stories, games, and visual metaphors that make complex concepts simple.
            </p>
            <Link href="/intro">
              <Button size="lg" className="text-lg px-8 py-6">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Your Crypto Adventure
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Badges Section */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">Your Achievements</h3>
          <div className="flex justify-center gap-4 flex-wrap">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`p-4 rounded-lg border ${
                  earnedBadges.includes(badge.id)
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <div className="text-2xl mb-2 text-center">{badge.icon}</div>
                <p className="text-sm font-medium text-center">{badge.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-bold text-center mb-12 text-foreground">Your Learning Journey</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  className={`h-full transition-all duration-300 hover:shadow-lg ${
                    section.locked ? "opacity-60" : "hover:scale-105"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          section.completed
                            ? "bg-primary text-primary-foreground"
                            : section.locked
                              ? "bg-muted text-muted-foreground"
                              : "bg-accent text-accent-foreground"
                        }`}
                      >
                        {section.icon}
                      </div>
                      {section.completed && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Award className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {section.locked && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Locked
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg text-balance">{section.title}</CardTitle>
                    <CardDescription className="text-pretty">{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {section.id === "intro" ? (
                      <Link href="/intro">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : section.id === "diffie-hellman" ? (
                      <Link href="/diffie-hellman">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : section.id === "rsa" ? (
                      <Link href="/rsa">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : section.id === "ecc" ? (
                      <Link href="/ecc">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : section.id === "aes" ? (
                      <Link href="/aes">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : section.id === "signatures" ? (
                      <Link href="/signatures">
                        <Button className="w-full" disabled={section.locked}>
                          {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={section.locked}
                        variant={section.completed ? "outline" : "default"}
                      >
                        {section.completed ? "Review" : section.locked ? "Locked" : "Start Learning"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            Built with ❤️ for curious minds who want to understand the secrets of secure communication
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Built by <span className="font-semibold text-foreground">Jagaputhran S</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
