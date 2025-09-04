"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Target, Zap, RotateCcw, Eye, EyeOff, CheckCircle } from "lucide-react"
import Link from "next/link"

interface ECPoint {
  x: number
  y: number
  isInfinity?: boolean
}

interface ECCState {
  aliceSecret: number
  bobSecret: number
  alicePublic: ECPoint | null
  bobPublic: ECPoint | null
  sharedSecret: ECPoint | null
  step: number
  animating: boolean
}

// Simple elliptic curve: y² = x³ + ax + b (mod p)
// Using curve y² = x³ + 7 (mod 17) for demonstration
const CURVE_A = 0
const CURVE_B = 7
const PRIME = 17

export default function ECCTrampolineVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [eccState, setEccState] = useState<ECCState>({
    aliceSecret: 3,
    bobSecret: 5,
    alicePublic: null,
    bobPublic: null,
    sharedSecret: null,
    step: 0,
    animating: false,
  })

  const [showEavesdropper, setShowEavesdropper] = useState(false)
  const [jumpAnimation, setJumpAnimation] = useState<{ active: boolean; point: ECPoint | null; count: number }>({
    active: false,
    point: null,
    count: 0,
  })

  // Base point G for the curve
  const basePoint: ECPoint = { x: 5, y: 1 }

  // Modular arithmetic helper
  const mod = (n: number, m: number): number => ((n % m) + m) % m

  // Modular inverse using extended Euclidean algorithm
  const modInverse = (a: number, m: number): number => {
    const extendedGCD = (a: number, b: number): [number, number, number] => {
      if (a === 0) return [b, 0, 1]
      const [gcd, x1, y1] = extendedGCD(b % a, a)
      const x = y1 - Math.floor(b / a) * x1
      const y = x1
      return [gcd, x, y]
    }

    const [, x] = extendedGCD(mod(a, m), m)
    return mod(x, m)
  }

  // Check if point is on the curve
  const isOnCurve = (point: ECPoint): boolean => {
    if (point.isInfinity) return true
    const { x, y } = point
    const leftSide = mod(y * y, PRIME)
    const rightSide = mod(x * x * x + CURVE_A * x + CURVE_B, PRIME)
    return leftSide === rightSide
  }

  // Point addition on elliptic curve
  const pointAdd = (P: ECPoint, Q: ECPoint): ECPoint => {
    if (P.isInfinity) return Q
    if (Q.isInfinity) return P

    if (P.x === Q.x) {
      if (P.y === Q.y) {
        // Point doubling
        const s = mod((3 * P.x * P.x + CURVE_A) * modInverse(2 * P.y, PRIME), PRIME)
        const x3 = mod(s * s - 2 * P.x, PRIME)
        const y3 = mod(s * (P.x - x3) - P.y, PRIME)
        return { x: x3, y: y3 }
      } else {
        // Points are inverses
        return { x: 0, y: 0, isInfinity: true }
      }
    }

    // General case
    const s = mod((Q.y - P.y) * modInverse(Q.x - P.x, PRIME), PRIME)
    const x3 = mod(s * s - P.x - Q.x, PRIME)
    const y3 = mod(s * (P.x - x3) - P.y, PRIME)
    return { x: x3, y: y3 }
  }

  // Scalar multiplication (repeated point addition)
  const scalarMultiply = (k: number, point: ECPoint): ECPoint => {
    if (k === 0) return { x: 0, y: 0, isInfinity: true }
    if (k === 1) return point

    let result: ECPoint = { x: 0, y: 0, isInfinity: true }
    let addend = point

    while (k > 0) {
      if (k & 1) {
        result = pointAdd(result, addend)
      }
      addend = pointAdd(addend, addend)
      k >>= 1
    }

    return result
  }

  // Generate all valid points on the curve
  const generateCurvePoints = (): ECPoint[] => {
    const points: ECPoint[] = []

    for (let x = 0; x < PRIME; x++) {
      const ySquared = mod(x * x * x + CURVE_A * x + CURVE_B, PRIME)

      for (let y = 0; y < PRIME; y++) {
        if (mod(y * y, PRIME) === ySquared) {
          points.push({ x, y })
        }
      }
    }

    return points
  }

  const curvePoints = generateCurvePoints()

  // Update public keys when secrets change
  useEffect(() => {
    const alicePublic = scalarMultiply(eccState.aliceSecret, basePoint)
    const bobPublic = scalarMultiply(eccState.bobSecret, basePoint)
    const sharedSecret = scalarMultiply(eccState.aliceSecret, bobPublic)

    setEccState((prev) => ({
      ...prev,
      alicePublic,
      bobPublic,
      sharedSecret,
    }))
  }, [eccState.aliceSecret, eccState.bobSecret])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const gridSize = Math.min(width, height) / (PRIME + 2)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1

    for (let i = 0; i <= PRIME; i++) {
      const x = (i + 1) * gridSize
      const y = (i + 1) * gridSize

      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(x, gridSize)
      ctx.lineTo(x, height - gridSize)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(gridSize, y)
      ctx.lineTo(width - gridSize, y)
      ctx.stroke()
    }

    // Draw curve points
    curvePoints.forEach((point) => {
      const x = (point.x + 1) * gridSize
      const y = height - (point.y + 1) * gridSize

      ctx.fillStyle = "#f1f5f9"
      ctx.strokeStyle = "#94a3b8"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
    })

    // Draw base point
    if (basePoint) {
      const x = (basePoint.x + 1) * gridSize
      const y = height - (basePoint.y + 1) * gridSize

      ctx.fillStyle = "#6366f1"
      ctx.strokeStyle = "#4f46e5"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Label
      ctx.fillStyle = "#4f46e5"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("G", x, y - 15)
    }

    // Draw Alice's public key
    if (eccState.alicePublic && !eccState.alicePublic.isInfinity) {
      const x = (eccState.alicePublic.x + 1) * gridSize
      const y = height - (eccState.alicePublic.y + 1) * gridSize

      ctx.fillStyle = "#059669"
      ctx.strokeStyle = "#047857"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Label
      ctx.fillStyle = "#047857"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("A", x, y - 18)
    }

    // Draw Bob's public key
    if (eccState.bobPublic && !eccState.bobPublic.isInfinity) {
      const x = (eccState.bobPublic.x + 1) * gridSize
      const y = height - (eccState.bobPublic.y + 1) * gridSize

      ctx.fillStyle = "#10b981"
      ctx.strokeStyle = "#059669"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Label
      ctx.fillStyle = "#059669"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("B", x, y - 18)
    }

    // Draw shared secret
    if (eccState.sharedSecret && !eccState.sharedSecret.isInfinity && eccState.step >= 3) {
      const x = (eccState.sharedSecret.x + 1) * gridSize
      const y = height - (eccState.sharedSecret.y + 1) * gridSize

      ctx.fillStyle = "#f59e0b"
      ctx.strokeStyle = "#d97706"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(x, y, 14, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Pulsing effect
      ctx.fillStyle = "rgba(245, 158, 11, 0.3)"
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, 2 * Math.PI)
      ctx.fill()

      // Label
      ctx.fillStyle = "#d97706"
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("S", x, y - 20)
    }

    // Draw jump animation
    if (jumpAnimation.active && jumpAnimation.point && !jumpAnimation.point.isInfinity) {
      const x = (jumpAnimation.point.x + 1) * gridSize
      const y = height - (jumpAnimation.point.y + 1) * gridSize

      // Bouncing effect
      const bounceOffset = Math.sin(Date.now() / 200) * 10

      ctx.fillStyle = "rgba(99, 102, 241, 0.8)"
      ctx.strokeStyle = "#6366f1"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x, y + bounceOffset, 15, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()

      // Jump counter
      ctx.fillStyle = "#6366f1"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Jump ${jumpAnimation.count}`, x, y + bounceOffset + 5)
    }
  }, [eccState, jumpAnimation, curvePoints])

  const nextStep = () => {
    if (eccState.step < 3) {
      setEccState((prev) => ({ ...prev, step: prev.step + 1 }))
    }
  }

  const resetDemo = () => {
    setEccState((prev) => ({ ...prev, step: 0 }))
    setJumpAnimation({ active: false, point: null, count: 0 })
  }

  const animateJumps = (secret: number, isAlice: boolean) => {
    setJumpAnimation({ active: true, point: basePoint, count: 0 })

    let currentPoint = basePoint
    let jumpCount = 0

    const jumpInterval = setInterval(() => {
      jumpCount++
      currentPoint = pointAdd(currentPoint, basePoint)

      setJumpAnimation({
        active: true,
        point: currentPoint,
        count: jumpCount,
      })

      if (jumpCount >= secret) {
        clearInterval(jumpInterval)
        setTimeout(() => {
          setJumpAnimation({ active: false, point: null, count: 0 })
        }, 1000)
      }
    }, 800)
  }

  const getStepDescription = () => {
    switch (eccState.step) {
      case 0:
        return "Alice and Bob agree on an elliptic curve and a base point G"
      case 1:
        return "Alice chooses her secret number and performs secret jumps on the trampoline"
      case 2:
        return "Bob chooses his secret number and performs his secret jumps"
      case 3:
        return "They calculate the shared secret using each other's public points"
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
              <Link href="/rsa">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to RSA
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-lg font-bold text-foreground">ECC Trampoline Adventure</h1>
                <p className="text-sm text-muted-foreground">Bouncing on elliptic curves for security</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline">Step {eccState.step + 1} of 4</Badge>
              <Progress value={(eccState.step / 3) * 100} className="w-24" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Step Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-balance">{getStepDescription()}</h2>
        </div>

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-primary rounded-full" />
                Alice's Trampoline Jumps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Secret Jumps: {eccState.aliceSecret}</Label>
                <Slider
                  value={[eccState.aliceSecret]}
                  onValueChange={([value]) => setEccState((prev) => ({ ...prev, aliceSecret: value }))}
                  min={1}
                  max={15}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Public Point (after {eccState.aliceSecret} jumps)</Label>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg font-mono text-sm">
                  {eccState.alicePublic && !eccState.alicePublic.isInfinity
                    ? `(${eccState.alicePublic.x}, ${eccState.alicePublic.y})`
                    : "Point at infinity"}
                </div>
              </div>

              <Button
                onClick={() => animateJumps(eccState.aliceSecret, true)}
                disabled={jumpAnimation.active}
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Watch Alice Jump
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-4 h-4 bg-secondary rounded-full" />
                Bob's Trampoline Jumps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Secret Jumps: {eccState.bobSecret}</Label>
                <Slider
                  value={[eccState.bobSecret]}
                  onValueChange={([value]) => setEccState((prev) => ({ ...prev, bobSecret: value }))}
                  min={1}
                  max={15}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="space-y-2">
                <Label>Public Point (after {eccState.bobSecret} jumps)</Label>
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg font-mono text-sm">
                  {eccState.bobPublic && !eccState.bobPublic.isInfinity
                    ? `(${eccState.bobPublic.x}, ${eccState.bobPublic.y})`
                    : "Point at infinity"}
                </div>
              </div>

              <Button
                onClick={() => animateJumps(eccState.bobSecret, false)}
                disabled={jumpAnimation.active}
                variant="secondary"
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Watch Bob Jump
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trampoline Grid Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5" />
              The Elliptic Curve Trampoline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Curve: y² = x³ + 7 (mod 17)</p>
              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full" />
                  <span>Base Point (G)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span>Alice's Public</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full" />
                  <span>Bob's Public</span>
                </div>
                {eccState.step >= 3 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span>Shared Secret</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <canvas ref={canvasRef} width={500} height={500} className="border border-border rounded-lg bg-card" />
            </div>
          </CardContent>
        </Card>

        {/* Shared Secret Display */}
        {eccState.step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-4">Shared Secret Established!</h3>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 max-w-md mx-auto">
                  <div className="font-mono text-2xl text-foreground mb-2">
                    {eccState.sharedSecret && !eccState.sharedSecret.isInfinity
                      ? `(${eccState.sharedSecret.x}, ${eccState.sharedSecret.y})`
                      : "Point at infinity"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Alice: {eccState.aliceSecret} × Bob's Public = Shared Secret
                    <br />
                    Bob: {eccState.bobSecret} × Alice's Public = Shared Secret
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Security Explanation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Why Reversing Jumps is Hard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2 text-foreground">Easy Direction (Forward Jumps)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Given secret number k and base point G</li>
                  <li>• Calculate k × G by repeated addition</li>
                  <li>
                    • Alice: {eccState.aliceSecret} × G = ({eccState.alicePublic?.x}, {eccState.alicePublic?.y})
                  </li>
                  <li>
                    • Bob: {eccState.bobSecret} × G = ({eccState.bobPublic?.x}, {eccState.bobPublic?.y})
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-foreground">Hard Direction (Reverse Jumps)</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Given public point P and base point G</li>
                  <li>• Find secret k such that k × G = P</li>
                  <li>• This is the Elliptic Curve Discrete Log Problem (ECDLP)</li>
                  <li>• No efficient algorithm known for large curves</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>The Trampoline Metaphor:</strong> It's easy to count your jumps as you bounce from point to
                point, but if someone only sees where you landed, it's extremely difficult to figure out how many jumps
                you took to get there - especially on a large trampoline with millions of possible landing spots!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eavesdropper */}
        <AnimatePresence>
          {showEavesdropper && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <Card className="mb-8 border-destructive/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-destructive-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive mb-2">Eve the Eavesdropper</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>I can see:</p>
                        <ul className="ml-4 space-y-1">
                          <li>
                            • Base point G: ({basePoint.x}, {basePoint.y})
                          </li>
                          <li>
                            • Alice's public: ({eccState.alicePublic?.x}, {eccState.alicePublic?.y})
                          </li>
                          <li>
                            • Bob's public: ({eccState.bobPublic?.x}, {eccState.bobPublic?.y})
                          </li>
                        </ul>
                        <p className="text-destructive font-medium">
                          But I can't figure out their secret jump counts or the shared secret!
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
            {eccState.step < 3 ? (
              <Button onClick={nextStep}>
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Link href="/aes">
                <Button>
                  Continue to AES
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
