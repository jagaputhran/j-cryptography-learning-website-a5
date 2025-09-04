"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Users, Lock, Unlock, Eye, EyeOff, CheckCircle, Play, Pause } from "lucide-react"
import Link from "next/link"

interface StoryStep {
  id: number
  title: string
  content: string
  visual: "communication" | "eavesdropper" | "encryption" | "secure"
  interactive?: boolean
}

export default function AliceBobIntro() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showEavesdropper, setShowEavesdropper] = useState(false)
  const [messageEncrypted, setMessageEncrypted] = useState(false)

  const storySteps: StoryStep[] = [
    {
      id: 0,
      title: "Meet Alice and Bob",
      content:
        "Alice and Bob are friends who want to share secrets across the internet. But there's a problem - anyone can intercept their messages!",
      visual: "communication",
    },
    {
      id: 1,
      title: "The Eavesdropper Appears",
      content:
        "Meet Eve, the eavesdropper! She's always listening to messages sent over the internet. When Alice sends 'Hello Bob!', Eve can read it too.",
      visual: "eavesdropper",
      interactive: true,
    },
    {
      id: 2,
      title: "The Problem with Plain Text",
      content:
        "Without protection, all messages are like postcards - anyone can read them. This is dangerous for sensitive information like passwords or personal data.",
      visual: "eavesdropper",
    },
    {
      id: 3,
      title: "Enter Cryptography",
      content:
        "Cryptography is like a magical lock and key system. Alice can lock her message with encryption, and only Bob has the key to unlock it!",
      visual: "encryption",
      interactive: true,
    },
    {
      id: 4,
      title: "Secure Communication",
      content:
        "Now when Alice sends an encrypted message, Eve sees only gibberish! The message 'Hello Bob!' becomes something like 'X7#mK9@pL2$'. Only Bob can decrypt it back to the original message.",
      visual: "secure",
    },
  ]

  const progress = ((currentStep + 1) / storySteps.length) * 100

  useEffect(() => {
    if (isPlaying && currentStep < storySteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, 4000)
      return () => clearTimeout(timer)
    } else if (currentStep >= storySteps.length - 1) {
      setIsPlaying(false)
    }
  }, [currentStep, isPlaying])

  const nextStep = () => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const renderVisual = () => {
    const step = storySteps[currentStep]

    switch (step.visual) {
      case "communication":
        return (
          <div className="flex items-center justify-between w-full max-w-md mx-auto">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Alice</p>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex-1 mx-4 h-1 bg-primary rounded-full relative"
            >
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 text-xs"
              >
                "Hello Bob!"
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-secondary-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Bob</p>
            </motion.div>
          </div>
        )

      case "eavesdropper":
        return (
          <div className="relative w-full max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Alice</p>
              </div>

              <div className="flex-1 mx-4 h-1 bg-primary rounded-full relative">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-2 py-1 text-xs">
                  "Hello Bob!"
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Bob</p>
              </div>
            </div>

            <AnimatePresence>
              {(showEavesdropper || !step.interactive) && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mb-2">
                    <Eye className="w-6 h-6 text-destructive-foreground" />
                  </div>
                  <p className="text-sm font-medium text-destructive">Eve (Eavesdropper)</p>
                  <div className="mt-2 bg-destructive/10 border border-destructive/20 rounded-lg px-2 py-1 text-xs text-destructive">
                    "I can see: Hello Bob!"
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step.interactive && (
              <div className="mt-20 text-center">
                <Button onClick={() => setShowEavesdropper(!showEavesdropper)} variant="outline" size="sm">
                  {showEavesdropper ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showEavesdropper ? "Hide Eve" : "Show Eve Listening"}
                </Button>
              </div>
            )}
          </div>
        )

      case "encryption":
        return (
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Alice</p>
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: messageEncrypted ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    messageEncrypted ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {messageEncrypted ? (
                    <Lock className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <Unlock className="w-6 h-6 text-muted-foreground" />
                  )}
                </motion.div>
                <p className="text-xs text-muted-foreground">Encryption</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Bob</p>
              </div>
            </div>

            <div className="text-center mb-4">
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">Message:</p>
                <p className="font-mono text-lg">{messageEncrypted ? "X7#mK9@pL2$" : "Hello Bob!"}</p>
              </div>
            </div>

            {step.interactive && (
              <div className="text-center">
                <Button onClick={() => setMessageEncrypted(!messageEncrypted)} className="mb-2">
                  {messageEncrypted ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Decrypt Message
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Encrypt Message
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">Try encrypting and decrypting the message!</p>
              </div>
            )}
          </div>
        )

      case "secure":
        return (
          <div className="w-full max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Alice</p>
              </div>

              <div className="flex-1 mx-4 relative">
                <div className="h-1 bg-primary rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1 text-xs">
                  X7#mK9@pL2$
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Bob</p>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-2">
                  <EyeOff className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Eve</p>
                <div className="mt-2 bg-muted/50 border border-border rounded-lg px-2 py-1 text-xs text-muted-foreground">
                  "I see: X7#mK9@pL2$"
                </div>
                <p className="text-xs text-muted-foreground mt-1">Confused!</p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-primary">Secure Communication Achieved!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Only Bob can decrypt "X7#mK9@pL2$" back to "Hello Bob!"
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Alice & Bob's Story</h1>
                <p className="text-sm text-muted-foreground">Introduction to Cryptography</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Step {currentStep + 1} of {storySteps.length}
              </Badge>
              <Progress value={progress} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      {/* Story Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Button onClick={togglePlay} variant="outline" size="sm">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <Button onClick={nextStep} disabled={currentStep === storySteps.length - 1} variant="outline" size="sm">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4 text-balance">
                    {storySteps[currentStep].title}
                  </h2>
                  <p className="text-lg text-muted-foreground text-pretty">{storySteps[currentStep].content}</p>
                </div>

                <div className="min-h-[300px] flex items-center justify-center">{renderVisual()}</div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === storySteps.length - 1 ? (
            <Link href="/diffie-hellman">
              <Button>
                Continue to Diffie-Hellman
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
