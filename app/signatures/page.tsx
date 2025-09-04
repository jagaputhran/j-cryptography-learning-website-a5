"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Zap,
  CheckCircle,
  XCircle,
  Stamp,
  Grid3X3,
  Hash,
  Shuffle,
  Code,
} from "lucide-react"
import Link from "next/link"

export default function SignaturesPage() {
  const [message, setMessage] = useState("This is Alice's authentic message!")
  const [signature, setSignature] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null)
  const [showQuantumThreat, setShowQuantumThreat] = useState(false)
  const [quantumProgress, setQuantumProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("signatures")
  const [sealBroken, setSealBroken] = useState(false)

  // PQC Demo States
  const [latticeDemo, setLatticeDemo] = useState({ userPath: "", correctPath: "→↓→→↓→↓↓→", attempts: 0 })
  const [hashCards, setHashCards] = useState(Array(10).fill(false))
  const [multivariateDemo, setMultivariateDemo] = useState({ userSolution: "", correctSolution: "ABCD" })
  const [codeDemo, setCodeDemo] = useState({ scrambledMessage: "H#E@L0", originalMessage: "HELLO" })

  const generateSignature = () => {
    const hash = message.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const sig = `SEAL_${hash.toString(16).toUpperCase()}_${Date.now().toString(36)}`
    setSignature(sig)
    setVerificationResult(null)
    setSealBroken(false)
  }

  const verifySignature = async () => {
    setIsVerifying(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const expectedHash = message.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const sigHash = signature.includes(`SEAL_${expectedHash.toString(16).toUpperCase()}`)

    setVerificationResult(sigHash)
    setSealBroken(!sigHash)
    setIsVerifying(false)
  }

  const tryLatticeGuess = () => {
    setLatticeDemo((prev) => ({
      ...prev,
      attempts: prev.attempts + 1,
    }))
  }

  const scratchHashCard = (index: number) => {
    setHashCards((prev) => prev.map((card, i) => (i === index ? true : card)))
  }

  const tryMultivariateGuess = () => {
    // Simulate maze solving attempt
    setMultivariateDemo((prev) => ({ ...prev, userSolution: "WRONG" }))
  }

  const decodeMessage = () => {
    setCodeDemo((prev) => ({ ...prev, scrambledMessage: prev.originalMessage }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Digital Signatures & Post-Quantum Cryptography
            </h1>
            <p className="text-gray-300 mt-2">Learn authentication and prepare for the quantum future</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { id: "signatures", label: "Digital Signatures", icon: Stamp },
            { id: "lattice", label: "Lattice Crypto", icon: Grid3X3 },
            { id: "hash", label: "Hash Signatures", icon: Hash },
            { id: "multivariate", label: "Multivariate", icon: Shuffle },
            { id: "code", label: "Code-Based", icon: Code },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Digital Signatures Section */}
        {activeTab === "signatures" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-blue-400" />
                  Digital Wax Seal Demo
                </CardTitle>
                <p className="text-sm text-gray-400">Like a unique wax seal that only you can create</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium mb-2">Message to Seal</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    className="bg-gray-700 border-gray-600 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="p-4 bg-red-900/30 rounded-lg border border-red-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Stamp className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">Your Private Stamp</span>
                    </div>
                    <div className="text-2xl text-center py-4">🔏</div>
                    <p className="text-xs text-red-200 text-center">Only you own this stamp</p>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Public Seal Pattern</span>
                    </div>
                    <div className="text-2xl text-center py-4">🏛️</div>
                    <p className="text-xs text-blue-200 text-center">Everyone knows your seal looks like this</p>
                  </motion.div>
                </div>

                {/* Signature Generation */}
                <div className="space-y-4">
                  <Button onClick={generateSignature} className="w-full bg-red-600 hover:bg-red-700">
                    <Stamp className="w-4 h-4 mr-2" />
                    Press Your Wax Seal
                  </Button>

                  {signature && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-700 rounded-lg relative"
                    >
                      <label className="block text-sm font-medium mb-2">Sealed Message</label>
                      <div className="relative">
                        <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded border-2 border-dashed border-yellow-500">
                          {message}
                        </div>
                        <motion.div
                          className={`absolute -bottom-2 -right-2 text-3xl ${sealBroken ? "opacity-50" : ""}`}
                          animate={sealBroken ? { rotate: [0, -10, 10, -5, 0], scale: [1, 0.9, 1.1, 0.95, 1] } : {}}
                        >
                          {sealBroken ? "💥" : "🔴"}
                        </motion.div>
                      </div>
                      <div className="text-xs font-mono text-yellow-300 mt-2 break-all">Seal ID: {signature}</div>
                    </motion.div>
                  )}
                </div>

                {/* Signature Verification */}
                {signature && (
                  <div className="space-y-4">
                    <Button
                      onClick={verifySignature}
                      disabled={isVerifying}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isVerifying ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Shield className="w-4 h-4 mr-2" />
                      )}
                      {isVerifying ? "Checking Seal..." : "Verify Seal Authenticity"}
                    </Button>

                    <AnimatePresence>
                      {verificationResult !== null && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`p-4 rounded-lg border-2 ${
                            verificationResult
                              ? "bg-green-900/30 border-green-500 text-green-300"
                              : "bg-red-900/30 border-red-500 text-red-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {verificationResult ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            <span className="font-semibold">
                              {verificationResult ? "Authentic Seal!" : "Broken Seal!"}
                            </span>
                          </div>
                          <p className="text-sm mt-1">
                            {verificationResult
                              ? "This seal matches the known pattern - message is authentic."
                              : "This seal is broken or forged - message has been tampered with!"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <Card className="bg-gradient-to-r from-purple-900/50 to-red-900/50 border-red-500/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-red-300 mb-2">🎯 Try This!</h4>
                    <p className="text-sm text-gray-300 mb-3">
                      Modify the message after sealing to see how the seal breaks!
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMessage(message + " [MODIFIED]")}
                      className="border-red-500 text-red-300 hover:bg-red-900/30"
                    >
                      Tamper with Message
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Quantum Threat Simulation */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Quantum Computing Threat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Security Status */}
                <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <h4 className="font-semibold text-green-300 mb-2">Current Security (2024)</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• RSA-2048: Safe for decades</li>
                    <li>• ECC-256: Quantum resistant until ~2030</li>
                    <li>• Classical computers: Cannot break</li>
                  </ul>
                </div>

                {/* Quantum Computer Simulation */}
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowQuantumThreat(true)}
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={showQuantumThreat && quantumProgress < 100}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Simulate Quantum Attack
                  </Button>

                  <AnimatePresence>
                    {showQuantumThreat && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                          <h4 className="font-semibold text-red-300 mb-2">Quantum Computer Active</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Breaking RSA-2048...</span>
                              <span>{quantumProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <motion.div
                                className="bg-red-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${quantumProgress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                          </div>
                          {quantumProgress === 100 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-3 p-2 bg-red-800 rounded text-sm"
                            >
                              💥 Private key extracted! All seals compromised!
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Post-Quantum Solutions */}
                <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                  <h4 className="font-semibold text-purple-300 mb-2">Post-Quantum Solutions</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Lattice-based cryptography</li>
                    <li>• Hash-based signatures</li>
                    <li>• Multivariate cryptography</li>
                    <li>• Code-based cryptography</li>
                  </ul>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white">Quantum Timeline</h4>
                  {[
                    { year: "2024", event: "Current classical security", color: "green" },
                    { year: "2030", event: "First cryptographically relevant quantum computers", color: "yellow" },
                    { year: "2035", event: "RSA/ECC potentially broken", color: "red" },
                    { year: "2040", event: "Post-quantum crypto standard", color: "blue" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.year}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Badge
                        variant="secondary"
                        className={`${
                          item.color === "green"
                            ? "bg-green-600"
                            : item.color === "yellow"
                              ? "bg-yellow-600"
                              : item.color === "red"
                                ? "bg-red-600"
                                : "bg-blue-600"
                        } text-white`}
                      >
                        {item.year}
                      </Badge>
                      <span className="text-sm text-gray-300">{item.event}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "lattice" && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-cyan-400" />
                Lattice-Based Cryptography (CRYSTALS-Kyber)
              </CardTitle>
              <p className="text-sm text-gray-400">Finding short paths in a city grid is very hard</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-cyan-300 mb-4">🏙️ The City Grid Analogy</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Imagine a massive city grid with millions of intersections. There's a secret "short path" hidden in
                    the noise, but finding it without the key is like searching every possible route.
                  </p>

                  {/* Interactive Grid */}
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="grid grid-cols-8 gap-1 mb-4">
                      {Array(64)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded border ${
                              latticeDemo.correctPath.includes("→") && i % 8 === 7
                                ? "bg-cyan-500"
                                : latticeDemo.correctPath.includes("↓") && Math.floor(i / 8) === 7
                                  ? "bg-cyan-500"
                                  : "bg-gray-700 border-gray-600"
                            }`}
                          />
                        ))}
                    </div>
                    <motion.div
                      className="text-cyan-400 text-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      ✨ Hidden short vector path
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-cyan-300 mb-4">🎮 Try to Find the Path</h4>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter path (e.g., →↓→→↓)"
                      value={latticeDemo.userPath}
                      onChange={(e) => setLatticeDemo((prev) => ({ ...prev, userPath: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button onClick={tryLatticeGuess} className="w-full bg-cyan-600 hover:bg-cyan-700">
                      Try This Path
                    </Button>
                    <div className="text-sm text-gray-400">
                      Attempts: {latticeDemo.attempts} / ∞
                      <br />
                      <span className="text-red-300">Even quantum computers struggle with this!</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-cyan-900/30 rounded-lg border border-cyan-500/30">
                    <h5 className="font-semibold text-cyan-300 mb-2">Why It's Secure</h5>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Exponentially many possible paths</li>
                      <li>• Short vector problem is NP-hard</li>
                      <li>• Quantum computers don't help much</li>
                      <li>• Used in NIST's post-quantum standards</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "hash" && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-orange-400" />
                Hash-Based Signatures (SPHINCS+)
              </CardTitle>
              <p className="text-sm text-gray-400">Like a stack of scratch cards - use once, then discard</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-orange-300 mb-4">🎫 Scratch Card Stack</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Each signature uses one "scratch card" from your stack. Once scratched, it can't be reused. The
                    public key knows what all your cards should look like when scratched.
                  </p>

                  <div className="grid grid-cols-5 gap-2">
                    {hashCards.map((scratched, i) => (
                      <motion.div
                        key={i}
                        className={`w-12 h-16 rounded border-2 cursor-pointer ${
                          scratched
                            ? "bg-orange-500 border-orange-400"
                            : "bg-gray-700 border-gray-600 hover:border-orange-400"
                        }`}
                        onClick={() => scratchHashCard(i)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center text-xs pt-2">{scratched ? "✓" : "?"}</div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Click cards to "sign messages" - {hashCards.filter(Boolean).length}/10 used
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-orange-300 mb-4">🔒 Security Properties</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-900/30 rounded-lg border border-orange-500/30">
                      <h5 className="font-semibold text-orange-300 mb-2">Advantages</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Quantum-safe (based on hash functions)</li>
                        <li>• Well-understood security</li>
                        <li>• Fast verification</li>
                        <li>• Minimal security assumptions</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                      <h5 className="font-semibold text-red-300 mb-2">Trade-offs</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Large signature sizes</li>
                        <li>• Limited number of signatures</li>
                        <li>• State management required</li>
                        <li>• Slower signing process</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => setHashCards(Array(10).fill(false))}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Reset Card Stack
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "multivariate" && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-green-400" />
                Multivariate Cryptography (Rainbow)
              </CardTitle>
              <p className="text-sm text-gray-400">A maze with multiple doors - only the private key knows the way</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-300 mb-4">🌈 The Rainbow Maze</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Imagine a complex maze with colored doors. The private key knows the secret sequence of colors to
                    navigate through, but the public sees only a scrambled, random-looking maze.
                  </p>

                  {/* Maze Visualization */}
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <div className="grid grid-cols-6 gap-1 mb-4">
                      {["🔴", "🟡", "🟢", "🔵", "🟣", "🟠"].map((color, i) => (
                        <motion.div
                          key={i}
                          className="w-8 h-8 flex items-center justify-center bg-gray-800 rounded border"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        >
                          {color}
                        </motion.div>
                      ))}
                    </div>
                    <div className="text-center text-green-400">Secret path: Red → Yellow → Green → Blue</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-green-300 mb-4">🎯 Try to Solve the Maze</h4>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter color sequence (e.g., RYGB)"
                      value={multivariateDemo.userSolution}
                      onChange={(e) => setMultivariateDemo((prev) => ({ ...prev, userSolution: e.target.value }))}
                      className="bg-gray-700 border-gray-600"
                    />
                    <Button onClick={tryMultivariateGuess} className="w-full bg-green-600 hover:bg-green-700">
                      Try This Path
                    </Button>

                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/30">
                      <div className="text-red-300 font-semibold mb-2">❌ Path Blocked!</div>
                      <p className="text-sm text-gray-300">
                        The maze is too complex to solve by guessing. You'd need to solve hundreds of polynomial
                        equations simultaneously!
                      </p>
                    </div>

                    <div className="p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                      <h5 className="font-semibold text-green-300 mb-2">Mathematical Foundation</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Based on solving multivariate polynomial systems</li>
                        <li>• NP-complete problem</li>
                        <li>• Rainbow scheme uses layered structure</li>
                        <li>• Compact signatures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "code" && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-400" />
                Code-Based Cryptography (McEliece)
              </CardTitle>
              <p className="text-sm text-gray-400">
                Messages with intentional typos - only the private key can fix them
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-purple-300 mb-4">📝 The Typo Dictionary</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Imagine sending a message full of intentional typos. Only someone with the special "error-correcting
                    dictionary" (private key) can fix all the typos and read the original message.
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Original Message:</div>
                      <div className="text-lg font-mono text-green-400">{codeDemo.originalMessage}</div>
                    </div>

                    <motion.div
                      className="text-center text-2xl"
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      ⚡
                    </motion.div>

                    <div className="p-4 bg-gray-900 rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Scrambled with Errors:</div>
                      <div className="text-lg font-mono text-red-400">{codeDemo.scrambledMessage}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-purple-300 mb-4">🔧 Error Correction Demo</h4>
                  <div className="space-y-4">
                    <Button onClick={decodeMessage} className="w-full bg-purple-600 hover:bg-purple-700">
                      Use Private Key to Fix Errors
                    </Button>

                    {codeDemo.scrambledMessage === codeDemo.originalMessage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-green-900/30 rounded-lg border border-green-500/30"
                      >
                        <div className="text-green-300 font-semibold mb-2">✅ Message Decoded!</div>
                        <p className="text-sm text-gray-300">
                          The private key successfully corrected all errors and revealed the original message.
                        </p>
                      </motion.div>
                    )}

                    <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
                      <h5 className="font-semibold text-purple-300 mb-2">How It Works</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Based on error-correcting codes</li>
                        <li>• McEliece cryptosystem (1978)</li>
                        <li>• Syndrome decoding problem</li>
                        <li>• Fast encryption/decryption</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
                      <h5 className="font-semibold text-yellow-300 mb-2">Trade-offs</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Very large public keys (MB size)</li>
                        <li>• Message expansion</li>
                        <li>• Well-studied security</li>
                        <li>• Quantum-resistant</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => setCodeDemo({ scrambledMessage: "H#E@L0", originalMessage: "HELLO" })}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Demo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Link href="/aes">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous: AES Encryption
            </Button>
          </Link>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Complete Journey
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
