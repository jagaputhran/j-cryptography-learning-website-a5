"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Play, RotateCcw, Shuffle, Key, Lock } from "lucide-react"
import Link from "next/link"

// AES Rubik's Cube colors representing different states
const CUBE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

interface CubeFace {
  id: number
  color: string
  value: string
}

interface RubiksCube {
  faces: CubeFace[][]
}

export default function AESPage() {
  const [cube, setCube] = useState<RubiksCube>({ faces: [] })
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [plaintext, setPlaintext] = useState("HELLO WORLD!")
  const [key, setKey] = useState("SECRET KEY 123")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [showSteps, setShowSteps] = useState(false)

  // Initialize cube with plaintext
  useEffect(() => {
    initializeCube()
  }, [plaintext])

  const initializeCube = () => {
    const paddedText = plaintext.padEnd(16, " ").slice(0, 16)
    const faces: CubeFace[][] = []

    for (let i = 0; i < 6; i++) {
      const face: CubeFace[] = []
      for (let j = 0; j < 9; j++) {
        const charIndex = (i * 9 + j) % paddedText.length
        face.push({
          id: i * 9 + j,
          color: CUBE_COLORS[charIndex % CUBE_COLORS.length],
          value: paddedText[charIndex] || " ",
        })
      }
      faces.push(face)
    }

    setCube({ faces })
    setCurrentRound(0)
  }

  const performAESRound = async () => {
    if (isAnimating) return

    setIsAnimating(true)

    // Simulate AES round operations
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCube((prevCube) => {
      const newFaces = prevCube.faces.map((face) =>
        face.map((cell) => ({
          ...cell,
          color: CUBE_COLORS[Math.floor(Math.random() * CUBE_COLORS.length)],
          value: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        })),
      )
      return { faces: newFaces }
    })

    setCurrentRound((prev) => prev + 1)
    setIsAnimating(false)
  }

  const startEncryption = async () => {
    setIsEncrypting(true)
    setShowSteps(true)

    for (let round = 0; round < 10; round++) {
      await performAESRound()
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setIsEncrypting(false)
  }

  const resetCube = () => {
    initializeCube()
    setShowSteps(false)
  }

  const CubeFaceComponent = ({ face, faceIndex }: { face: CubeFace[]; faceIndex: number }) => (
    <motion.div
      className="grid grid-cols-3 gap-1 p-2 bg-gray-800 rounded-lg"
      initial={{ rotateY: 0 }}
      animate={{
        rotateY: isAnimating ? 360 : 0,
        scale: isAnimating ? 1.1 : 1,
      }}
      transition={{ duration: 0.5, delay: faceIndex * 0.1 }}
    >
      {face.map((cell, index) => (
        <motion.div
          key={cell.id}
          className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: cell.color }}
          animate={{
            backgroundColor: cell.color,
            rotate: isAnimating ? 180 : 0,
          }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {cell.value}
        </motion.div>
      ))}
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AES Encryption Cube
            </h1>
            <p className="text-gray-300 mt-2">Watch your data get scrambled through the AES encryption rounds!</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Interactive Cube */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-purple-400" />
                Interactive AES Cube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Plaintext (16 chars max)</label>
                  <Input
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Enter your message..."
                    className="bg-gray-700 border-gray-600"
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Encryption Key</label>
                  <Input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter encryption key..."
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              {/* Cube Visualization */}
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {cube.faces.slice(0, 6).map((face, index) => (
                    <CubeFaceComponent key={index} face={face} faceIndex={index} />
                  ))}
                </div>
              </div>

              {/* Round Counter */}
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Round: {currentRound} / 10
                </Badge>
              </div>

              {/* Controls */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startEncryption}
                  disabled={isEncrypting || isAnimating}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isEncrypting ? "Encrypting..." : "Start Encryption"}
                </Button>
                <Button onClick={performAESRound} disabled={isAnimating || isEncrypting} variant="outline">
                  Next Round
                </Button>
                <Button onClick={resetCube} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AES Steps Explanation */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                AES Encryption Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence>
                {showSteps && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    {[
                      { step: "SubBytes", desc: "Each byte is replaced using a substitution table", icon: "🔄" },
                      { step: "ShiftRows", desc: "Rows are shifted cyclically to the left", icon: "↔️" },
                      { step: "MixColumns", desc: "Columns are mixed using matrix multiplication", icon: "🌀" },
                      { step: "AddRoundKey", desc: "Round key is XORed with the state", icon: "🔑" },
                    ].map((operation, index) => (
                      <motion.div
                        key={operation.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          currentRound > index ? "bg-green-900/30 border-green-400" : "bg-gray-700/30 border-gray-500"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{operation.icon}</span>
                          <div>
                            <h4 className="font-semibold text-white">{operation.step}</h4>
                            <p className="text-sm text-gray-300">{operation.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security Explanation */}
              <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
                <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Why AES is Secure
                </h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 10 rounds of complex transformations</li>
                  <li>• Each round mixes data thoroughly</li>
                  <li>• Impossible to reverse without the key</li>
                  <li>• Used by governments and banks worldwide</li>
                </ul>
              </div>

              {/* Interactive Challenge */}
              <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">🎮 Challenge</h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Try encrypting different messages and see how the cube changes!
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPlaintext("CRYPTO IS FUN!")}>
                      Try "CRYPTO IS FUN!"
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPlaintext("SECRET MESSAGE")}>
                      Try "SECRET MESSAGE"
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Link href="/ecc">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous: ECC Trampolines
            </Button>
          </Link>
          <Link href="/signatures">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Next: Digital Signatures
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
