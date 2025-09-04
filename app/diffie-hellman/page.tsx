"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Key, Users, Zap, Eye, EyeOff, Play, RotateCcw, CheckCircle } from "lucide-react"
import Link from "next/link"

interface DiffieHellmanState {
  p: number // Prime modulus
  g: number // Generator
  alicePrivate: number
  bobPrivate: number
  alicePublic: number
  bobPublic: number
  sharedSecret: number
  step: number
}

export default function DiffieHellmanDemo() {
  const [state, setState] = useState<DiffieHellmanState>({
    p: 23,
    g: 5,
    alicePrivate: 6,
    bobPrivate: 15,
    alicePublic: 0,
    bobPublic: 0,
    sharedSecret: 0,
    step: 0,
  })

  const [isAnimating, setIsAnimating] = useState(false)
  const [showEavesdropper, setShowEavesdropper] = useState(false)
  const [bruteForceAttempts, setBruteForceAttempts] = useState(0)
  const [securityLevel, setSecurityLevel] = useState<"weak" | "medium" | "strong">("weak")

  // Calculate modular exponentiation
  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1
    base = base % mod
    while (exp > 0) {
      if (exp % 2 === 1) {
        result = (result * base) % mod
      }
      exp = Math.floor(exp / 2)
      base = (base * base) % mod
    }
    return result
  }

  // Calculate public keys and shared secret
  useEffect(() => {
    const alicePublic = modPow(state.g, state.alicePrivate, state.p)
    const bobPublic = modPow(state.g, state.bobPrivate, state.p)
    const sharedSecret = modPow(bobPublic, state.alicePrivate, state.p)

    setState((prev) => ({
      ...prev,
      alicePublic,
      bobPublic,
      sharedSecret,
    }))

    // Determine security level based on prime size
    if (state.p < 100) setSecurityLevel("weak")
    else if (state.p < 1000) setSecurityLevel("medium")
    else setSecurityLevel("strong")
  }, [state.p, state.g, state.alicePrivate, state.bobPrivate])

  const nextStep = () => {
    if (state.step < 4) {
      setIsAnimating(true)
      setState((prev) => ({ ...prev, step: prev.step + 1 }))
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const resetDemo = () => {
    setState((prev) => ({ ...prev, step: 0 }))
    setBruteForceAttempts(0)
  }

  const simulateBruteForce = () => {
    setIsAnimating(true)
    let attempts = 0
    const maxAttempts = state.p - 1

    const interval = setInterval(() => {
      attempts++
      setBruteForceAttempts(attempts)

      if (attempts >= maxAttempts || attempts > 50) {
        clearInterval(interval)
        setIsAnimating(false)
      }
    }, 100)
  }

  const getStepDescription = () => {
    switch (state.step) {
      case 0:
        return "Alice and Bob agree on public parameters: prime p and generator g"
      case 1:
        return "Alice chooses her private key and calculates her public key"
      case 2:
        return "Bob chooses his private key and calculates his public key"
      case 3:
        return "Alice and Bob exchange their public keys"
      case 4:
        return "Both calculate the same shared secret using their private key and the other's public key"
      default:
        return ""
    }
  }

  const ColorBeam = ({ from, to, color, delay = 0 }: { from: string; to: string; color: string; delay?: number }) => (
    <motion.div
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, delay }}
      className={`absolute inset-0 pointer-events-none`}
    >
      <svg className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.line
          x1="20%"
          y1="50%"
          x2="80%"
          y2="50%"
          stroke={`url(#gradient-${color})`}
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay }}
        />
      </svg>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/intro">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Story
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Diffie-Hellman Key Exchange</h1>
                <p className="text-sm text-muted-foreground">Share secrets without sharing secrets</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">Step {state.step + 1} of 5</Badge>
              <Progress value={(state.step / 4) * 100} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Step Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-balance">{getStepDescription()}</h2>
        </div>

        {/* Interactive Controls */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Public Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prime">Prime (p)</Label>
                <Input
                  id="prime"
                  type="number"
                  value={state.p}
                  onChange={(e) => setState((prev) => ({ ...prev, p: Number.parseInt(e.target.value) || 23 }))}
                  min="3"
                  max="9999"
                />
              </div>
              <div>
                <Label htmlFor="generator">Generator (g)</Label>
                <Input
                  id="generator"
                  type="number"
                  value={state.g}
                  onChange={(e) => setState((prev) => ({ ...prev, g: Number.parseInt(e.target.value) || 5 }))}
                  min="2"
                  max={state.p - 1}
                />
              </div>
              <div className="text-xs text-muted-foreground">These are shared publicly</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded-full" />
                Alice's Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="alice-private">Private Key (a)</Label>
                <Input
                  id="alice-private"
                  type="number"
                  value={state.alicePrivate}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, alicePrivate: Number.parseInt(e.target.value) || 6 }))
                  }
                  min="1"
                  max={state.p - 1}
                />
                <div className="text-xs text-muted-foreground mt-1">Secret - never shared</div>
              </div>
              <div>
                <Label>Public Key (g^a mod p)</Label>
                <div className="p-2 bg-muted rounded-md font-mono text-sm">{state.alicePublic}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {state.g}^{state.alicePrivate} mod {state.p} = {state.alicePublic}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded-full" />
                Bob's Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bob-private">Private Key (b)</Label>
                <Input
                  id="bob-private"
                  type="number"
                  value={state.bobPrivate}
                  onChange={(e) => setState((prev) => ({ ...prev, bobPrivate: Number.parseInt(e.target.value) || 15 }))}
                  min="1"
                  max={state.p - 1}
                />
                <div className="text-xs text-muted-foreground mt-1">Secret - never shared</div>
              </div>
              <div>
                <Label>Public Key (g^b mod p)</Label>
                <div className="p-2 bg-muted rounded-md font-mono text-sm">{state.bobPublic}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {state.g}^{state.bobPrivate} mod {state.p} = {state.bobPublic}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Demonstration */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="relative min-h-[400px]">
              {/* Alice and Bob */}
              <div className="flex items-center justify-between mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Alice</h3>
                  <div className="text-sm text-muted-foreground text-center mt-2">
                    <div>Private: {state.alicePrivate}</div>
                    <div>Public: {state.alicePublic}</div>
                  </div>
                </motion.div>

                <div className="flex-1 mx-8 relative">
                  {/* Key Exchange Animation */}
                  <AnimatePresence>
                    {state.step >= 3 && (
                      <>
                        <ColorBeam from="alice" to="bob" color="#059669" delay={0} />
                        <ColorBeam from="bob" to="alice" color="#10b981" delay={0.5} />
                      </>
                    )}
                  </AnimatePresence>

                  {/* Public Keys Display */}
                  {state.step >= 3 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-lg p-4 text-center"
                      >
                        <Key className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <div className="text-xs text-muted-foreground">Public Keys Exchanged</div>
                        <div className="font-mono text-sm">
                          A→B: {state.alicePublic}
                          <br />
                          B→A: {state.bobPublic}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Bob</h3>
                  <div className="text-sm text-muted-foreground text-center mt-2">
                    <div>Private: {state.bobPrivate}</div>
                    <div>Public: {state.bobPublic}</div>
                  </div>
                </motion.div>
              </div>

              {/* Shared Secret */}
              {state.step >= 4 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 max-w-md mx-auto">
                    <CheckCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-primary mb-2">Shared Secret Established!</h4>
                    <div className="font-mono text-2xl text-foreground mb-2">{state.sharedSecret}</div>
                    <div className="text-xs text-muted-foreground">
                      Alice: {state.bobPublic}^{state.alicePrivate} mod {state.p} = {state.sharedSecret}
                      <br />
                      Bob: {state.alicePublic}^{state.bobPrivate} mod {state.p} = {state.sharedSecret}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Eavesdropper */}
              <AnimatePresence>
                {showEavesdropper && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mb-2">
                        <Eye className="w-8 h-8 text-destructive-foreground" />
                      </div>
                      <p className="text-sm font-medium text-destructive">Eve</p>
                      <div className="mt-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 text-xs text-destructive max-w-xs text-center">
                        I can see: p={state.p}, g={state.g}, A={state.alicePublic}, B={state.bobPublic}
                        <br />
                        But I can't find the shared secret: {state.sharedSecret}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Security Analysis */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Security Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    securityLevel === "weak"
                      ? "bg-destructive"
                      : securityLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-primary"
                  }`}
                />
                <span className="font-medium capitalize">{securityLevel}</span>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {securityLevel === "weak" && "Small primes are easily crackable"}
                {securityLevel === "medium" && "Medium primes provide moderate security"}
                {securityLevel === "strong" && "Large primes are computationally secure"}
              </div>
              <div className="space-y-2">
                <div className="text-xs">Prime size: {state.p.toString().length} digits</div>
                <div className="text-xs">Brute force attempts needed: up to {state.p - 1}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Brute Force Attack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={simulateBruteForce}
                  disabled={isAnimating}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isAnimating ? "Attacking..." : "Simulate Attack"}
                </Button>
                <div className="text-sm">
                  Attempts: {bruteForceAttempts} / {state.p - 1}
                </div>
                <Progress value={(bruteForceAttempts / (state.p - 1)) * 100} />
                {bruteForceAttempts > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {bruteForceAttempts >= state.p - 1 || bruteForceAttempts > 50
                      ? "Attack completed or timed out"
                      : "Trying to crack Alice's private key..."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button onClick={resetDemo} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={() => setShowEavesdropper(!showEavesdropper)} variant="outline">
              {showEavesdropper ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showEavesdropper ? "Hide" : "Show"} Eavesdropper
            </Button>
          </div>

          <div className="flex gap-2">
            {state.step < 4 ? (
              <Button onClick={nextStep} disabled={isAnimating}>
                {isAnimating ? <Play className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                Next Step
              </Button>
            ) : (
              <Link href="/rsa">
                <Button>
                  Continue to RSA
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
