"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Wallet,
  User,
  Menu
} from "lucide-react"
import Link from "next/link"

// Expanded array with all new images
const realImages = [
  "/images/robot-flower.jpg",
  "/images/black-cat.jpg",
  "/images/psychedelic-face.jpg",
  "/images/portal-jump.jpg",
  "/images/colorful-portrait.jpg",
  "/images/abstract-head.jpg",
  "/images/digital-touch.jpg",
  "/images/digital-hands.jpg",
  "/images/gradient-cat.jpg",
  "/images/rainbow-bear.jpg",
  "/images/holographic-face.jpg",
  "/images/space-cat.jpg",
  "/images/pop-art-portrait.jpg",
  "/images/colorful-skull.jpg",
  "/images/surreal-collage.jpg",
  "/images/egg-magnifier.jpg",
  "/images/martini-glasses.jpg",
  "/images/ufo-mouth.jpg",
  "/images/binocular-fingers.jpg",
  "/images/anime-cyberpunk.jpg",
  "/images/flame-cat.jpg",
  "/images/on-fire-face.jpg",
  "/images/psychedelic-eyes.jpg",
  "/images/shocked-cat.jpg",
  "/images/holographic-tablet.jpg",
  "/images/mystical-hands.jpg",
  "/images/crystal-astronaut.jpg",
  "/images/smiley-paddle.jpg",
  "/images/keyhole-eye.jpg",
  "/images/poker-aces.jpg",
  "/images/ping-pong-smiley.jpg",
  "/images/shocked-cat-yellow.jpg",
  "/images/poker-hand-aces.jpg",
  "/images/holographic-fish-tablet.jpg",
  "/images/keyhole-green-eye.jpg",
  "/images/crystal-astronaut-chair.jpg",
  "/images/psychedelic-woman-eyes.jpg",
  "/images/mystical-hands-moon.jpg",
  "/images/rainbow-mouth-space.jpg",
  "/images/purple-figure-chair.jpg",
  "/images/blue-eyes-pattern.jpg",
  "/images/fingers-spiral-pink.jpg",
  "/images/yellow-spiral-smiley.jpg",
  "/images/checkered-mouth-yellow.jpg",
  "/images/colorful-hands-unity.jpg",
]

function generateTunnelLayers() {
  const layers = []
  const totalLayers = 20
  const baseRectanglesPerLayer = 12

  for (let layer = 0; layer < totalLayers; layer++) {
    const layerDepth = layer * 280
    const layerScale = Math.pow(0.92, layer)
    const rectangleSize = Math.max(180 * layerScale, 8)
    const rectanglesPerLayer = Math.max(baseRectanglesPerLayer - Math.floor(layer / 7), 5)
    const rotationOffset = layer * 18

    const baseRadius = layer < 5 ? 900 + layer * 150 : 700 + layer * 120

    for (let i = 0; i < rectanglesPerLayer; i++) {
      const angle = (360 / rectanglesPerLayer) * i + rotationOffset
      const radius = baseRadius

      const x = Math.cos((angle * Math.PI) / 180) * radius * layerScale
      const y = Math.sin((angle * Math.PI) / 180) * radius * layerScale

      const distanceFromCenter = Math.sqrt(x * x + y * y)
      const maxDistance = 1600
      const perspectiveIntensity = Math.min(distanceFromCenter / maxDistance, 1)

      const useRealImage = Math.random() < 0.8
      const imageIndex = Math.floor(Math.random() * realImages.length)

      layers.push({
        id: `layer-${layer}-${i}`,
        x,
        y,
        z: -layerDepth,
        size: rectangleSize,
        rotation: angle,
        layer,
        index: i,
        scale: layerScale,
        opacity: Math.max(0.85 - layer * 0.03, 0.1),
        perspectiveIntensity,
        angleToCenter: Math.atan2(y, x) * (180 / Math.PI),
        useRealImage,
        imageIndex,
      })
    }
  }

  return layers
}

export default function Component() {
  const [titleHovered, setTitleHovered] = useState(false)
  const [autoGlitch, setAutoGlitch] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState<"home" | "discover" | "artist">("home")
  const [rectangles, setRectangles] = useState<any[]>([])

  // Auto glitch effect every 8-12 seconds
  useEffect(() => {
    const triggerAutoGlitch = () => {
      setAutoGlitch(true)
      setTimeout(() => setAutoGlitch(false), 800)
    }

    const randomInterval = () => {
      const delay = Math.random() * 4000 + 8000
      setTimeout(() => {
        triggerAutoGlitch()
        randomInterval()
      }, delay)
    }

    randomInterval()
  }, [])

  useEffect(() => {
    setRectangles(generateTunnelLayers())
    const interval = setInterval(() => {
      setRectangles(generateTunnelLayers())
    }, 2000) // Atualiza a cada 2 segundos
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen overflow-hidden relative bg-black">
      {/* Background Tunnel - Show in both modes */}
      <div className={`absolute inset-0 ${isDarkMode ? "opacity-50" : "opacity-30"}`}>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "2200px", perspectiveOrigin: "center center" }}
        >
          <div
            className="relative preserve-3d"
            style={{ transformStyle: "preserve-3d", transform: "rotateX(0deg) rotateY(0deg)" }}
          >
            {rectangles.map((rect) => {
              const perspectiveSkew = rect.perspectiveIntensity * 8

              return (
                <div
                  key={rect.id}
                  className="absolute"
                  style={{
                    transform: `translate3d(${rect.x}px, ${rect.y}px, ${rect.z}px) rotateZ(${rect.rotation}deg)`,
                    transformStyle: "preserve-3d",
                    width: `${rect.size}px`,
                    height: `${rect.size * 0.75}px`,
                    opacity: rect.opacity,
                  }}
                >
                  <div
                    className={`absolute overflow-hidden rounded-sm ${isDarkMode ? "bg-gray-900" : "bg-gray-200"}`}
                    style={{
                      top: "0px",
                      left: "0px",
                      right: "0px",
                      bottom: "0px",
                      clipPath: `polygon(${perspectiveSkew * 0.3}% 0%, ${100 - perspectiveSkew * 0.3}% 0%, ${100 - perspectiveSkew * 0.2}% 100%, ${perspectiveSkew * 0.2}% 100%)`,
                    }}
                  >
                    {rect.useRealImage ? (
                      <Image
                        src={realImages[rect.imageIndex] || "/placeholder.svg"}
                        alt={`Artwork ${rect.imageIndex + 1}`}
                        fill
                        className="object-cover"
                        style={{ transform: "rotate(90deg)" }}
                        sizes="250px"
                      />
                    ) : (
                      <div className={`w-full h-full ${isDarkMode ? "bg-gray-800" : "bg-gray-300"}`} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-50 flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <h3 className={`font-bold text-xl tracking-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>nfthing</h3>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#"
            className={`hover:opacity-70 transition-colors font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Explore
          </a>
          <a
            href="/generator"
            className={`hover:opacity-70 transition-colors font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Create
          </a>
          <a
            href="#"
            className={`hover:opacity-70 transition-colors font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Community
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Wallet className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center px-6">
        <div
          className="glitch-container mb-6"
          onMouseEnter={() => setTitleHovered(true)}
          onMouseLeave={() => setTitleHovered(false)}
        >
          <h1
            className={`glitch-text text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight cursor-pointer text-white ${titleHovered || autoGlitch ? "glitch-active" : ""}`}
            data-text="nfthing"
          >
            nfthing
          </h1>
        </div>

        <h2
          className="text-xl md:text-2xl lg:text-3xl font-semibold mb-8"
          style={{
            background: "linear-gradient(90deg, #ff0000 0%, #ffff00 25%, #00ff00 50%, #0000ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          for creators and NFT lovers
        </h2>

        <p
          className={`text-lg md:text-xl max-w-2xl mb-12 leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          create, discover, and trade unique digital assets in Monad Testnet
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className={`font-semibold px-8 py-3 text-lg`}
          >
            <Link href="/generator">Create NFT</Link>
          </Button>       
          
        </div>
      </main>

      {/* Mobile responsive overlay for small screens */}
      <div className="md:hidden absolute inset-0 bg-black/70 z-30"></div>

      {/* Subtle vignette effect */}
      {isDarkMode && (
        <div
          className="absolute inset-0 pointer-events-none z-20"
          style={{ background: "radial-gradient(circle at center, transparent 25%, rgba(0, 0, 0, 0.8) 100%)" }}
        />
      )}
    </div>
  )
}
