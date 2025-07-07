"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function useThemeLogo() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Retorna a logo baseada no tema atual
  const getLogo = () => {
    if (!mounted) return "/logo_preta.png" // fallback
    
    const currentTheme = resolvedTheme || theme
    
    if (currentTheme === "light") {
      return "/logo_branca.png"
    } else {
      return "/logo_preta.png"
    }
  }

  return {
    logo: getLogo(),
    theme: mounted ? (resolvedTheme || theme) : "dark",
    mounted
  }
} 