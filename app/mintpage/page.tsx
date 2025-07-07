"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
// Slider component not available, using input range instead
import { useDropzone } from "react-dropzone"
import { Upload, Eye, Palette, Image as ImageIcon, Users, Coins, Calendar, CheckCircle } from "lucide-react"
import { useThemeLogo } from "@/hooks/useTheme"
import { ModeToggle } from "@/components/toogle"
import ConnectButton from "@/components/ConnectButton"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MintingPageData {
  nftImage: string | null
  nftName: string
  imageSize: number
  layout: "Classic" | "Minimalist" | "Showcase"
  backgroundColor: string
  backgroundImage: string | null
  showBackground: boolean
  price: string
  totalSupply: number
  mintedCount: number
  userCount: number
  mintingStage: "Whitelisted" | "Public"
  mintingStatus: "Started" | "Completed"
}

export default function MintingPage() {
  const router = useRouter()
  const { logo } = useThemeLogo()
  const [mintingData, setMintingData] = useState<MintingPageData>({
    nftImage: null,
    nftName: "My Awesome NFT",
    imageSize: 400,
    layout: "Classic",
    backgroundColor: "#1a1a1a",
    backgroundImage: null,
    showBackground: true,
    price: "0.1",
    totalSupply: 100,
    mintedCount: 342,
    userCount: 156,
    mintingStage: "Public",
    mintingStatus: "Started"
  })

  const [showPreview, setShowPreview] = useState(false)

  const onNFTImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setMintingData(prev => ({
          ...prev,
          nftImage: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const onBackgroundImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setMintingData(prev => ({
          ...prev,
          backgroundImage: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps: getNFTImageProps, getInputProps: getNFTImageInputProps } = useDropzone({
    onDrop: onNFTImageDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  const { getRootProps: getBackgroundImageProps, getInputProps: getBackgroundImageInputProps } = useDropzone({
    onDrop: onBackgroundImageDrop,
    accept: { 'image/*': [] },
    multiple: false
  })

  const layouts = [
    { id: "Classic", name: "Classic", description: "Traditional layout with centered NFT" },
    { id: "Minimalist", name: "Minimalist", description: "Clean and simple design" },
    { id: "Showcase", name: "Showcase", description: "Full-screen NFT display" }
  ]

  const colorOptions = [
    // Grays
    "#1a1a1a", "#2d2d2d", "#3a3a3a", "#4a4a4a", "#5a5a5a",
    "#6a6a6a", "#7a7a7a", "#8a8a8a", "#9a9a9a", "#ffffff",
    // Reds
    "#ff0000", "#ff3333", "#ff6666", "#ff9999", "#ffcccc",
    // Oranges
    "#ff6600", "#ff8833", "#ffaa66", "#ffcc99", "#ffddcc",
    // Yellows
    "#ffff00", "#ffff33", "#ffff66", "#ffff99", "#ffffcc",
    // Greens
    "#00ff00", "#33ff33", "#66ff66", "#99ff99", "#ccffcc",
    // Blues
    "#0000ff", "#3333ff", "#6666ff", "#9999ff", "#ccccff",
    // Purples
    "#8000ff", "#9933ff", "#b366ff", "#cc99ff", "#ddccff",
    // Pinks
    "#ff0080", "#ff3399", "#ff66b3", "#ff99cc", "#ffcce6"
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="NFThing Logo" className="h-8 w-20 object-contain" />
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <ConnectButton />
              <Button variant="ghost" onClick={() => router.push('/')} className="text-foreground">Back</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-4 h-4" />
                  NFT Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* NFT Name e Image Size em coluna, ao lado do campo de imagem */}
                <div className="flex flex-col md:flex-row md:items-start md:gap-6 space-y-4 md:space-y-0">
                  {/* Coluna esquerda: NFT Name e Image Size */}
                  <div className="flex-1 space-y-1">
                    <div>
                      <Label className="mb-1 block">NFT Name</Label>
                      <Input
                        value={mintingData.nftName}
                        onChange={(e) => setMintingData(prev => ({ ...prev, nftName: e.target.value }))}
                        placeholder="Enter NFT name"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="mb-1 block mt-6">Image Size: {mintingData.imageSize}px</Label>
                      <input
                        type="range"
                        value={mintingData.imageSize}
                        onChange={(e) => setMintingData(prev => ({ ...prev, imageSize: parseInt(e.target.value) }))}
                        max={800}
                        min={200}
                        step={10}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                  {/* Coluna direita: NFT Image */}
                  <div className="flex-1 flex justify-center">
                    <div className="space-y-1 w-full max-w-xs">
                      <Label className="mb-1 block">NFT Image</Label>
                      <div
                        {...getNFTImageProps()}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <input {...getNFTImageInputProps()} />
                        {mintingData.nftImage ? (
                          <div className="space-y-2">
                            <img 
                              src={mintingData.nftImage} 
                              alt="NFT Preview" 
                              className="w-24 h-24 object-cover mx-auto rounded-lg"
                            />
                            <p className="text-xs text-gray-600">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-6 h-6 mx-auto text-gray-400" />
                            <p className="text-xs text-gray-600">Drop your NFT image here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="w-4 h-4" />
                  Layout & Background
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Layout Selection */}
                <div className="space-y-2">
                  <Label>Layout Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {layouts.map((layout) => (
                      <div
                        key={layout.id}
                        className={`flex flex-col items-center p-2 border rounded-lg cursor-pointer transition-colors min-w-0 ${
                          mintingData.layout === layout.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setMintingData(prev => ({ ...prev, layout: layout.id as any }))}
                        style={{ minHeight: 70 }}
                      >
                        <div className="font-medium text-sm text-center whitespace-nowrap">{layout.name}</div>
                        <div className="text-xs text-gray-600 text-center whitespace-nowrap overflow-hidden text-ellipsis" style={{maxWidth: '100%'}}>{layout.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Options e Background Color lado a lado e alinhados */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-4 space-y-2 md:space-y-0">
                  {/* Toggle Show Background */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showBackground"
                      checked={mintingData.showBackground}
                      onChange={(e) => setMintingData(prev => ({ ...prev, showBackground: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="showBackground" className="text-sm">Show Background</Label>
                  </div>
                  {/* Color Picker alinhado */}
                  {mintingData.showBackground && (
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="backgroundColor" className="text-sm mb-0">Background Color</Label>
                      <input
                        id="backgroundColor"
                        type="color"
                        value={mintingData.backgroundColor}
                        onChange={e => setMintingData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
                      />
                      <Label htmlFor="backgroundColorHex" className="text-sm mb-0">HEX</Label>
                      <input
                        id="backgroundColorHex"
                        type="text"
                        value={mintingData.backgroundColor}
                        onChange={e => setMintingData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="w-24 px-2 py-1 border rounded bg-background text-foreground text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Background Image Upload */}
                {mintingData.showBackground && (
                  <div className="space-y-2">
                    <Label className="text-sm">Background Image (Optional)</Label>
                    <div
                      {...getBackgroundImageProps()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-gray-400 transition-colors"
                    >
                      <input {...getBackgroundImageInputProps()} />
                      {mintingData.backgroundImage ? (
                        <div className="space-y-2">
                          <img 
                            src={mintingData.backgroundImage} 
                            alt="Background Preview" 
                            className="w-20 h-12 object-cover mx-auto rounded"
                          />
                          <p className="text-xs text-gray-600">Click to change background</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="w-5 h-5 mx-auto text-gray-400" />
                          <p className="text-xs text-gray-600">Drop background image here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Minting Page Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative rounded-lg overflow-hidden"
                  style={{ 
                    backgroundColor: mintingData.showBackground ? mintingData.backgroundColor : 'transparent',
                    backgroundImage: mintingData.showBackground && mintingData.backgroundImage ? `url(${mintingData.backgroundImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '300px'
                  }}
                >
                  {/* Layout-specific content */}
                  {mintingData.layout === "Classic" && (
                    <div className="p-4 text-center">
                      <div className="mb-6">
                        <h1 className="text-2xl font-bold text-white mb-3">{mintingData.nftName}</h1>
                        <div className="flex justify-center space-x-3 mb-4">
                          <Badge variant="secondary" className="text-xs">Monad Testnet</Badge>
                          <Badge variant={mintingData.mintingStage === "Whitelisted" ? "default" : "secondary"} className="text-xs">
                            {mintingData.mintingStage}
                          </Badge>
                          <Badge variant={mintingData.mintingStatus === "Started" ? "default" : "secondary"} className="text-xs">
                            {mintingData.mintingStatus}
                          </Badge>
                        </div>
                      </div>
                      
                      {mintingData.nftImage && (
                        <div className="mb-6">
                          <img 
                            src={mintingData.nftImage} 
                            alt="NFT" 
                            style={{ width: Math.min(mintingData.imageSize, 300), height: Math.min(mintingData.imageSize, 300) }}
                            className="mx-auto rounded-lg shadow-lg"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{mintingData.mintedCount}</div>
                          <div className="text-xs text-gray-300">Total Minted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{mintingData.userCount}</div>
                          <div className="text-xs text-gray-300">Users</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-white">{mintingData.price} MON</div>
                          <div className="text-xs text-gray-300">Price</div>
                        </div>
                      </div>

                      <Button className="px-6 py-2 text-base">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mint Now
                      </Button>
                    </div>
                  )}

                  {mintingData.layout === "Minimalist" && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold text-white">{mintingData.nftName}</h1>
                        <Badge variant="secondary" className="text-xs">{mintingData.price} MON</Badge>
                      </div>
                      
                      {mintingData.nftImage && (
                        <div className="mb-6 flex justify-center">
                          <img 
                            src={mintingData.nftImage} 
                            alt="NFT" 
                            style={{ width: Math.min(mintingData.imageSize * 0.7, 250), height: Math.min(mintingData.imageSize * 0.7, 250) }}
                            className="rounded-lg"
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>Network</span>
                          <span>Monad Testnet</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>Status</span>
                          <span>{mintingData.mintingStatus}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>Minted</span>
                          <span>{mintingData.mintedCount} / {mintingData.totalSupply}</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4 h-9">
                        Mint
                      </Button>
                    </div>
                  )}

                  {mintingData.layout === "Showcase" && (
                    <div className="relative h-full">
                      {mintingData.nftImage && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={mintingData.nftImage} 
                            alt="NFT" 
                            style={{ width: Math.min(mintingData.imageSize, 350), height: Math.min(mintingData.imageSize, 350) }}
                            className="rounded-lg shadow-2xl"
                          />
                        </div>
                      )}
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                          <h1 className="text-xl font-bold text-white mb-2">{mintingData.nftName}</h1>
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-3 text-xs text-gray-300">
                              <span>{mintingData.mintedCount} minted</span>
                              <span>{mintingData.price} MON</span>
                            </div>
                            <Button className="h-8 text-sm">
                              <CheckCircle className="w-3 h-3 mr-2" />
                              Mint
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Minting Information moved here */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="w-4 h-4" />
                  Minting Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-sm">Price (MON)</Label>
                    <Input
                      value={mintingData.price}
                      onChange={(e) => setMintingData(prev => ({ ...prev, price: e.target.value }))}
                      type="number"
                      step="0.01"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Collection Size</Label>
                    <Input
                      value={mintingData.totalSupply}
                      onChange={(e) => setMintingData(prev => ({ ...prev, totalSupply: parseInt(e.target.value) }))}
                      type="number"
                      placeholder="Same as generator"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Minting Stage</Label>
                    <select
                      value={mintingData.mintingStage}
                      onChange={(e) => setMintingData(prev => ({ ...prev, mintingStage: e.target.value as any }))}
                      className="w-full min-w-[120px] p-2 border rounded-md h-10 text-sm"
                    >
                      <option value="Whitelisted">Whitelisted</option>
                      <option value="Public">Public</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Status</Label>
                    <select
                      value={mintingData.mintingStatus}
                      onChange={(e) => setMintingData(prev => ({ ...prev, mintingStatus: e.target.value as any }))}
                      className="w-full min-w-[120px] p-2 border rounded-md h-10 text-sm"
                    >
                      <option value="Started">Started</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => {
                localStorage.setItem('mintingPreviewData', JSON.stringify(mintingData));
                router.push('/mintpage/preview');
              }}
              className="w-full py-2 text-base font-semibold"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Minting Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 