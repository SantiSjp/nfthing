"use client"
import ConnectButton from "../ConnectButton"
import { ModeToggle } from "../toogle"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useThemeLogo } from "@/hooks/useTheme"

interface GeneratorHeaderProps {
  currentStep: number
  generatedNFTs: any[]
  uploadResults: any
  onStepClick: (step: number) => void
}

export function GeneratorHeader({ currentStep, generatedNFTs, uploadResults, onStepClick }: GeneratorHeaderProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter()
  const { logo } = useThemeLogo()

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            {mounted && (
              <img
                src={logo}
                alt="NFThing Logo"
                className="h-15 w-20 object-contain"
              />
            )}
          </div>

          {/* Steps Navigation - Centered */}
          <div className="flex items-center space-x-4">
            {/* Generate Step */}
            <div
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onStepClick(1)}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors ${
                  currentStep === 1
                    ? "bg-blue-600 border-blue-600 text-white"
                    : currentStep > 1
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                }`}
              >
                <span className="text-sm font-medium">{currentStep > 1 ? "✓" : "1"}</span>
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  currentStep === 1 ? "text-blue-600" : currentStep > 1 ? "text-green-600" : "text-gray-500"
                }`}
              >
                Generate
              </div>
            </div>

            {/* Connector Line */}
            <div className="h-px w-12 bg-gray-300"></div>

            {/* Preview Step */}
            <div
              className={`flex items-center space-x-2 transition-opacity ${
                generatedNFTs.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => generatedNFTs.length > 0 && onStepClick(2)}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors ${
                  currentStep === 2
                    ? "bg-blue-600 border-blue-600 text-white"
                    : currentStep > 2
                      ? "bg-green-600 border-green-600 text-white"
                      : generatedNFTs.length > 0
                        ? "border-gray-400 bg-white text-gray-600"
                        : "border-gray-300 bg-gray-100 text-gray-400"
                }`}
              >
                <span className="text-sm font-medium">{currentStep > 2 ? "✓" : "2"}</span>
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  currentStep === 2
                    ? "text-blue-600"
                    : currentStep > 2
                      ? "text-green-600"
                      : generatedNFTs.length > 0
                        ? "text-gray-600"
                        : "text-gray-400"
                }`}
              >
                Preview
              </div>
            </div>

            {/* Connector Line */}
            <div className="h-px w-12 bg-gray-300"></div>

            {/* Export/Upload Step */}
            <div
              className={`flex items-center space-x-2 transition-opacity ${
                generatedNFTs.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => generatedNFTs.length > 0 && onStepClick(3)}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors ${
                  currentStep === 3
                    ? "bg-blue-600 border-blue-600 text-white"
                    : currentStep > 3
                      ? "bg-green-600 border-green-600 text-white"
                      : generatedNFTs.length > 0
                        ? "border-gray-400 bg-white text-gray-600"
                        : "border-gray-300 bg-gray-100 text-gray-400"
                }`}
              >
                <span className="text-sm font-medium">{currentStep > 3 ? "✓" : "3"}</span>
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  currentStep === 3
                    ? "text-blue-600"
                    : currentStep > 3
                      ? "text-green-600"
                      : generatedNFTs.length > 0
                        ? "text-gray-600"
                        : "text-gray-400"
                }`}
              >
                Export
              </div>
            </div>

            {/* Connector Line */}
            <div className="h-px w-12 bg-gray-300"></div>

            {/* Deploy Step */}
            <div
              className={`flex items-center space-x-2 transition-opacity ${
                uploadResults ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed opacity-50"
              }`}
              onClick={() => uploadResults && onStepClick(4)}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md border-2 transition-colors ${
                  currentStep === 4
                    ? "bg-blue-600 border-blue-600 text-white"
                    : uploadResults
                      ? "border-gray-400 bg-white text-gray-600"
                      : "border-gray-300 bg-gray-100 text-gray-400"
                }`}
              >
                <span className="text-sm font-medium">4</span>
              </div>
              <div
                className={`text-sm font-medium transition-colors ${
                  currentStep === 4 ? "text-blue-600" : uploadResults ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Deploy
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/')} className="text-white">Back</Button>
              <ConnectButton />
              <ModeToggle />
            </div>
        </div>
      </div>
    </div>
  )
}
