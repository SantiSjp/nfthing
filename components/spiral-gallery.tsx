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
import { ModeToggle } from "./toogle"
import ConnectButton from "./ConnectButton"

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
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/5.jpg",
  "/images/6.jpg",
  "/images/7.jpg",
  "/images/8.jpg",
  "/images/9.jpg",
  "/images/10.jpg",
  "/images/11.jpg",
  "/images/12.jpg",
  "/images/13.jpg",
  "/images/14.jpg",
  "/images/15.jpg",
  "/images/16.jpg",
  "/images/17.jpg",
  "/images/18.jpg",
  "/images/19.jpg",
  "/images/20.jpg",
  "/images/21.jpg",
  "/images/22.jpg",
  "/images/23.jpg",
  "/images/24.jpg",
  "/images/25.jpg",
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
        imageIndex,
      })
    }
  }

  return layers
}

export default function Component() {
  const [titleHovered, setTitleHovered] = useState(false)
  const [autoGlitch, setAutoGlitch] = useState(false)
  const [currentPage, setCurrentPage] = useState<"home" | "discover" | "artist">("home")
  const [rectangles, setRectangles] = useState<any[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const logo = "/logo_branca.png"
  const isDarkMode = false
  const [isLogoHovered, setIsLogoHovered] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState(0)
  const totalLayers = 20
  const [lastAngle, setLastAngle] = useState<number | null>(null)

  // Auto glitch effect every 8-12 seconds
  useEffect(() => {
    const triggerAutoGlitch = () => {
      setAutoGlitch(true)
      setTimeout(() => setAutoGlitch(false), 800)
    }

    const randomInterval = () => {
      const delay = 1000
      setTimeout(() => {
        triggerAutoGlitch()
        randomInterval()
      }, delay)
    }

    randomInterval()
  }, [])

  useEffect(() => {
    setRectangles(generateTunnelLayers())
  }, [])
 
  useEffect(() => {
    if (rectangles.length === 0) return;
    const interval = setInterval(() => {
      setRectangles(rects =>
        rects.map(rect => ({
          ...rect,
          imageIndex: Math.floor(Math.random() * realImages.length),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [rectangles.length]);

  return (
    <div
      className="min-h-screen overflow-hidden relative bg-white"
      onMouseEnter={e => {
        setIsLogoHovered(true)
        if (visibleLayers === 0) {
          setVisibleLayers(1)
          setLastAngle(null)
        }
      }}
      onMouseMove={e => {
        if (visibleLayers >= totalLayers) return;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (lastAngle !== null) {
          let delta = angle - lastAngle;
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          if (delta > 0) {
            setVisibleLayers(prev => (prev < totalLayers ? prev + 1 : prev));
          }
        }
        setLastAngle(angle);
      }}
      onMouseLeave={() => {}}
    >
      {/* Background Tunnel - Show only on logo hover */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${visibleLayers > 0 ? 'opacity-90' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "2200px", perspectiveOrigin: "center center" }}
        >
          <div
            className="relative preserve-3d"
            style={{ transformStyle: "preserve-3d", transform: "rotateX(0deg) rotateY(0deg)" }}
          >
            {rectangles.filter(rect => rect.layer >= totalLayers - visibleLayers).map((rect) => {
              const perspectiveSkew = rect.perspectiveIntensity * 8

              return (
                <div
                  key={rect.id}
                  className="absolute"
                  style={{
                    transform: `translate3d(${rect.x}px, ${rect.y}px, ${rect.z}px) rotateZ(${rect.rotation}deg)`,
                    transformStyle: "preserve-3d",
                    width: `${rect.size}px`,
                    height: `${rect.size}px`,
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
                    <Image
                      src={realImages[rect.imageIndex] && realImages[rect.imageIndex].endsWith('.jpg') ? realImages[rect.imageIndex] : "/images/1.jpg"}
                      alt={`Artwork ${rect.imageIndex + 1}`}
                      fill
                      className="object-cover"
                      style={{ transform: "rotate(90deg)" }}
                      sizes="250px"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-50 grid grid-cols-3 items-center p-6">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="nfthing" className="w-25 h-10" />
        </div>

        <nav className="hidden md:flex items-center space-x-8 justify-center">
          <a
            href="/explorer"
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
            href="/dashboard"
            className={`hover:opacity-70 transition-colors font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Dashboard
          </a>
        </nav>

        <div className="flex items-center space-x-4 justify-end">          
          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
          <div className="flex justify-end p-4">
            <button
              className="text-white text-3xl focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
          <nav className="flex flex-col items-center gap-8 mt-8">
            <a
              href="/explorer"
              className="text-white text-xl font-medium hover:opacity-70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explore
            </a>
            <a
              href="/generator"
              target="_blank"
              className="text-white text-xl font-medium hover:opacity-70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Create
            </a>
            <a
              href="/dashboard"
              className="text-white text-xl font-medium hover:opacity-70"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </a>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-40 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-center px-6">
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white">
            <img 
              src={logo} 
              alt="nfthing" 
              className="w-100 h-40"
              style={{cursor: 'pointer'}}
            />
          </h1>
        </div>

        <h2
          className={`text-xl md:text-2xl lg:text-3xl font-semibold mb-8 ${isDarkMode ? 'text-white' : 'text-black'}`}
        >
          for creators and NFT lovers
        </h2>

        <p
          className={`text-lg md:text-xl max-w-2xl mb-12 leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          create, deploy and make your mint page on monad testnet
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className={`bg-black text-white hover:bg-white hover:text-black font-semibold px-8 py-3 text-lg`}
          >
            <Link href="/generator" target="_blank">Get Started</Link>
          </Button>       
          
        </div>
      </main>

      {/* Mobile responsive overlay for small screens */}
      {/* <div className="md:hidden absolute inset-0 bg-black/70 z-30"></div> */}

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
