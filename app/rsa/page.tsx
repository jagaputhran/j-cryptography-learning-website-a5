"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  Key,
  Box,
  Zap,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Trophy,
} from "lucide-react"
import Link from "next/link"

interface RSAKeys {
  n: number
  e: number
  d: number
  p: number
  q: number
  phi: number
}

interface GameState {
  step: number
  p: number
  q: number
  message: string
  encryptedMessage: string
  keys: RSAKeys | null
  coprimeGame: {
    active: boolean
    target: number
    attempts: number
    found: number[]
    score: number
  }
}

export default function RSASecretBoxGame() {
  const [gameState, setGameState] = useState<GameState>({
    step: 0,
    p: 7,
    q: 11,
    message: "HELLO",
    encryptedMessage: "",
    keys: null,
    coprimeGame: {
      active: false,
      target: 40,
      attempts: 0,
      found: [],
      score: 0,
    },
  })

  const [animatingBox, setAnimatingBox] = useState(false)
  const [showMath, setShowMath] = useState(false)

  // Check if number is prime
  const isPrime = (num: number): boolean => {
    if (num < 2) return false
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false
    }
    return true
  }

  // Calculate GCD
  const gcd = (a: number, b: number): number => {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  // Modular exponentiation
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

  // Extended Euclidean Algorithm for modular inverse
  const modInverse = (a: number, m: number): number => {
    const extendedGCD = (a: number, b: number): [number, number, number] => {
      if (a === 0) return [b, 0, 1]
      const [gcd, x1, y1] = extendedGCD(b % a, a)
      const x = y1 - Math.floor(b / a) * x1
      const y = x1
      return [gcd, x, y]
    }

    const [, x] = extendedGCD(a, m)
    return ((x % m) + m) % m
  }

  // Generate RSA keys
  const generateKeys = (p: number, q: number): RSAKeys | null => {
    if (!isPrime(p) || !isPrime(q) || p === q) return null

    const n = p * q
    const phi = (p - 1) * (q - 1)

    // Find e (commonly 65537, but we'll use smaller numbers for demo)
    let e = 3
    while (e < phi && gcd(e, phi) !== 1) {
      e += 2
    }

    if (e >= phi) return null

    const d = modInverse(e, phi)

    return { n, e, d, p, q, phi }
  }

  // Convert string to numbers for encryption
  const stringToNumbers = (str: string): number[] => {
    return str
      .toUpperCase()
      .split("")
      .map((char) => char.charCodeAt(0) - 65 + 1)
  }

  // Convert numbers back to string
  const numbersToString = (nums: number[]): string => {
    return nums.map((num) => String.fromCharCode(num + 65 - 1)).join("")
  }

  // RSA encrypt
  const rsaEncrypt = (message: string, keys: RSAKeys): number[] => {
    const numbers = stringToNumbers(message)
    return numbers.map((num) => modPow(num, keys.e, keys.n))
  }

  // RSA decrypt
  const rsaDecrypt = (encrypted: number[], keys: RSAKeys): string => {
    const decrypted = encrypted.map((num) => modPow(num, keys.d, keys.n))
    return numbersToString(decrypted)
  }

  // Update keys when p or q changes
  useEffect(() => {
    const keys = generateKeys(gameState.p, gameState.q)
    setGameState((prev) => ({ ...prev, keys }))
  }, [gameState.p, gameState.q])

  // Encrypt message when keys or message changes
  useEffect(() => {
    if (gameState.keys && gameState.message) {
      try {
        const encrypted = rsaEncrypt(gameState.message, gameState.keys)
        setGameState((prev) => ({ ...prev, encryptedMessage: encrypted.join(",") }))
      } catch (error) {
        setGameState((prev) => ({ ...prev, encryptedMessage: "Error" }))
      }
    }
  }, [gameState.keys, gameState.message])

  const nextStep = () => {
    if (gameState.step < 4) {
      setGameState((prev) => ({ ...prev, step: prev.step + 1 }))
    }
  }

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      step: 0,
      coprimeGame: { ...prev.coprimeGame, active: false, attempts: 0, found: [], score: 0 },
    }))
  }

  const startCoprimeGame = () => {
    if (!gameState.keys) return
    setGameState((prev) => ({
      ...prev,
      coprimeGame: {
        ...prev.coprimeGame,
        active: true,
        target: prev.keys!.phi,
        attempts: 0,
        found: [],
        score: 0,
      },
    }))
  }

  const checkCoprime = (num: number) => {
    if (!gameState.keys) return

    const isCoprimeWithPhi = gcd(num, gameState.keys.phi) === 1
    const alreadyFound = gameState.coprimeGame.found.includes(num)

    setGameState((prev) => ({
      ...prev,
      coprimeGame: {
        ...prev.coprimeGame,
        attempts: prev.coprimeGame.attempts + 1,
        found: isCoprimeWithPhi && !alreadyFound ? [...prev.coprimeGame.found, num] : prev.coprimeGame.found,
        score: isCoprimeWithPhi && !alreadyFound ? prev.coprimeGame.score + 10 : prev.coprimeGame.score,
      },
    }))
  }

  const encryptMessage = () => {
    setAnimatingBox(true)
    setTimeout(() => setAnimatingBox(false), 1000)
  }

  const decryptMessage = () => {
    setAnimatingBox(true)
    setTimeout(() => setAnimatingBox(false), 1000)
  }

  const getStepDescription = () => {
    switch (gameState.step) {
      case 0:
        return "Choose two prime numbers p and q to create your secret box"
      case 1:
        return "Generate your public and private keys"
      case 2:
        return "Lock your message in the secret box using the public key"
      case 3:
        return "Unlock the message using your private key"
      case 4:
        return "Master the coprime mini-game to understand Euler's totient function"
      default:
        return ""
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/diffie-hellman">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Diffie-Hellman
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-bold text-foreground">RSA Secret Box Game</h1>
                <p className="text-sm text-muted-foreground">Public locks, private keys, and mathematical magic</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">Step {gameState.step + 1} of 5</Badge>
              <Progress value={(gameState.step / 4) * 100} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Step Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-balance">{getStepDescription()}</h2>
        </div>

        {/* Prime Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5" />
                Prime Numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prime-p">Prime p</Label>
                <Input
                  id="prime-p"
                  type="number"
                  value={gameState.p}
                  onChange={(e) => setGameState((prev) => ({ ...prev, p: Number.parseInt(e.target.value) || 7 }))}
                  min="3"
                  max="97"
                />
                <div className="text-xs mt-1">
                  {isPrime(gameState.p) ? (
                    <span className="text-primary flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Valid prime
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not a prime number
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="prime-q">Prime q</Label>
                <Input
                  id="prime-q"
                  type="number"
                  value={gameState.q}
                  onChange={(e) => setGameState((prev) => ({ ...prev, q: Number.parseInt(e.target.value) || 11 }))}
                  min="3"
                  max="97"
                />
                <div className="text-xs mt-1">
                  {isPrime(gameState.q) ? (
                    <span className="text-primary flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Valid prime
                    </span>
                  ) : (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Not a prime number
                    </span>
                  )}
                </div>
              </div>

              {gameState.p === gameState.q && (
                <div className="text-xs text-destructive">p and q must be different primes</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Generated Keys
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState.keys ? (
                <>
                  <div>
                    <Label>n = p × q</Label>
                    <div className="p-2 bg-muted rounded-md font-mono text-sm">{gameState.keys.n}</div>
                    <div className="text-xs text-muted-foreground">
                      {gameState.p} × {gameState.q} = {gameState.keys.n}
                    </div>
                  </div>

                  <div>
                    <Label>φ(n) = (p-1)(q-1)</Label>
                    <div className="p-2 bg-muted rounded-md font-mono text-sm">{gameState.keys.phi}</div>
                    <div className="text-xs text-muted-foreground">
                      ({gameState.p}-1)({gameState.q}-1) = {gameState.keys.phi}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Public Key (e)</Label>
                      <div className="p-2 bg-primary/10 rounded-md font-mono text-sm text-center">
                        {gameState.keys.e}
                      </div>
                    </div>
                    <div>
                      <Label>Private Key (d)</Label>
                      <div className="p-2 bg-destructive/10 rounded-md font-mono text-sm text-center">
                        {gameState.keys.d}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>Invalid primes selected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secret Box Visualization */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">The Secret Box</h3>

              {/* Message Input */}
              <div className="max-w-md mx-auto mb-6">
                <Label htmlFor="message">Your Secret Message</Label>
                <Input
                  id="message"
                  value={gameState.message}
                  onChange={(e) =>
                    setGameState((prev) => ({ ...prev, message: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") }))
                  }
                  placeholder="HELLO"
                  maxLength={10}
                  className="text-center font-mono text-lg"
                />
                <div className="text-xs text-muted-foreground mt-1">Letters only, max 10 characters</div>
              </div>

              {/* Secret Box Animation */}
              <div className="relative max-w-lg mx-auto">
                <motion.div
                  animate={{
                    scale: animatingBox ? [1, 1.1, 1] : 1,
                    rotateY: animatingBox ? [0, 180, 360] : 0,
                  }}
                  transition={{ duration: 1 }}
                  className="relative"
                >
                  <div className="w-48 h-32 mx-auto bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary flex items-center justify-center relative">
                    <Box className="w-16 h-16 text-primary" />

                    {/* Lock/Unlock Icon */}
                    <motion.div
                      className="absolute -top-4 -right-4 w-12 h-12 bg-card border-2 border-border rounded-full flex items-center justify-center"
                      animate={{ rotate: animatingBox ? 360 : 0 }}
                      transition={{ duration: 1 }}
                    >
                      {gameState.step >= 2 ? (
                        <Lock className="w-6 h-6 text-primary" />
                      ) : (
                        <Unlock className="w-6 h-6 text-muted-foreground" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Message Display */}
                <div className="mt-6 space-y-4">
                  <div>
                    <Label>Original Message</Label>
                    <div className="p-3 bg-card border border-border rounded-lg font-mono text-lg">
                      {gameState.message || "Enter a message"}
                    </div>
                  </div>

                  {gameState.step >= 2 && gameState.encryptedMessage && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                      <Label>Encrypted Message</Label>
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg font-mono text-sm">
                        {gameState.encryptedMessage}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 mt-8">
                {gameState.step >= 1 && gameState.keys && (
                  <>
                    <Button onClick={encryptMessage} disabled={!gameState.message}>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock Message
                    </Button>

                    {gameState.step >= 2 && (
                      <Button onClick={decryptMessage} variant="outline">
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock Message
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coprime Mini-Game */}
        {gameState.step >= 4 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Coprime Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!gameState.coprimeGame.active ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Find numbers that are coprime with φ(n) = {gameState.keys?.phi}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Two numbers are coprime if their greatest common divisor (GCD) is 1
                  </p>
                  <Button onClick={startCoprimeGame}>
                    <Zap className="w-4 h-4 mr-2" />
                    Start Challenge
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Find coprimes with {gameState.coprimeGame.target}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {gameState.coprimeGame.score} | Attempts: {gameState.coprimeGame.attempts}
                      </p>
                    </div>
                    <Badge variant="outline">Found: {gameState.coprimeGame.found.length}</Badge>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 20 }, (_, i) => i + 2).map((num) => {
                      const isFound = gameState.coprimeGame.found.includes(num)
                      const isCoprime = gcd(num, gameState.coprimeGame.target) === 1

                      return (
                        <Button
                          key={num}
                          variant={isFound ? "default" : "outline"}
                          size="sm"
                          onClick={() => checkCoprime(num)}
                          disabled={isFound}
                          className={isFound && isCoprime ? "bg-primary" : ""}
                        >
                          {num}
                        </Button>
                      )
                    })}
                  </div>

                  {gameState.coprimeGame.found.length >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                      <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-medium text-primary">Excellent work!</p>
                      <p className="text-sm text-muted-foreground">You've mastered the concept of coprimes!</p>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mathematical Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Mathematical Details</span>
              <Button variant="ghost" size="sm" onClick={() => setShowMath(!showMath)}>
                {showMath ? "Hide" : "Show"} Math
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showMath && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Key Generation:</h4>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>
                        • Choose two prime numbers: p = {gameState.p}, q = {gameState.q}
                      </li>
                      <li>• Calculate n = p × q = {gameState.keys?.n}</li>
                      <li>• Calculate φ(n) = (p-1)(q-1) = {gameState.keys?.phi}</li>
                      <li>• Choose e such that gcd(e, φ(n)) = 1: e = {gameState.keys?.e}</li>
                      <li>• Calculate d such that e × d ≡ 1 (mod φ(n)): d = {gameState.keys?.d}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Encryption/Decryption:</h4>
                    <ul className="space-y-1 text-muted-foreground ml-4">
                      <li>• Encryption: c = m^e mod n</li>
                      <li>• Decryption: m = c^d mod n</li>
                      <li>
                        • Public key: (n, e) = ({gameState.keys?.n}, {gameState.keys?.e})
                      </li>
                      <li>
                        • Private key: (n, d) = ({gameState.keys?.n}, {gameState.keys?.d})
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Game
          </Button>

          <div className="flex gap-2">
            {gameState.step < 4 ? (
              <Button onClick={nextStep} disabled={!gameState.keys}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Link href="/ecc">
                <Button>
                  Continue to ECC
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
