"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Web3StorageModal } from "@/components/web3-storage-modal"
import { DeployCollection } from "@/components/deploy-collection"
import { StepOne } from "@/components/generator/step-one"
import { ExportUploadStep } from "@/components/generator/export-upload-step"
import { GeneratorHeader } from "@/components/generator/generator-header"
import { toast } from "sonner"

interface Trait {
  id: string
  name: string
  image: string
}

interface Layer {
  id: string
  name: string
  visible: boolean
  traits: Trait[]
  usage: number
  order: number
}

interface CollectionSettings {
  name: string
  description: string
  itemPrefix: string
  width: number
  height: number
  size: number
}

interface GeneratedNFT {
  id: number
  traits: { layerId: string; trait: Trait }[]
  image: string
}

interface FilterState {
  [layerId: string]: string[]
}

export default function NFTGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [layers, setLayers] = useState<Layer[]>([
    { id: "1", name: "Background", visible: true, traits: [], usage: 100, order: 0 },
    { id: "2", name: "Body", visible: true, traits: [], usage: 100, order: 1 },
  ])

  const [selectedLayer, setSelectedLayer] = useState<string>("1")
  const [previewTraits, setPreviewTraits] = useState<{ [layerId: string]: Trait | null }>({})
  const [showSizeWarning, setShowSizeWarning] = useState(false)
  const [generatedNFTs, setGeneratedNFTs] = useState<GeneratedNFT[]>([])
  const [selectedNFT, setSelectedNFT] = useState<GeneratedNFT | null>(null)
  const [draggedLayer, setDraggedLayer] = useState<string | null>(null)
  const [editingLayer, setEditingLayer] = useState<string | null>(null)
  const [editingLayerName, setEditingLayerName] = useState("")
  const [filters, setFilters] = useState<FilterState>({})
  const [selectedTraitForEdit, setSelectedTraitForEdit] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showWeb3Modal, setShowWeb3Modal] = useState(false)
  const [uploadResults, setUploadResults] = useState<any>(null)
  const [deploymentData, setDeploymentData] = useState<any>(null)

  const [collectionSettings, setCollectionSettings] = useState<CollectionSettings>({
    name: "My collection",
    description: "Enter description",
    itemPrefix: "Output ex: 1",
    width: 600,
    height: 600,
    size: 100,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (!file.type.startsWith("image/")) {
          alert("Please upload only image files.")
          return
        }

        if (file.size > 2 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Please upload images smaller than 2MB.`)
          return
        }

        const reader = new FileReader()
        reader.onload = () => {
          const newTrait: Trait = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: file.name.split(".")[0],
            image: reader.result as string,
          }

          setLayers((prev) =>
            prev.map((layer) =>
              layer.id === selectedLayer ? { ...layer, traits: [...layer.traits, newTrait] } : layer,
            ),
          )
        }
        reader.readAsDataURL(file)
      })
    },
    [selectedLayer],
  )

  const addLayer = () => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `Layer ${layers.length + 1}`,
      visible: true,
      traits: [],
      usage: 100,
      order: layers.length,
    }
    setLayers((prev) => [...prev, newLayer])
  }

  const deleteLayer = (layerId: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId))
    if (selectedLayer === layerId && layers.length > 1) {
      setSelectedLayer(layers.find((l) => l.id !== layerId)?.id || layers[0].id)
    }
  }

  const toggleLayerVisibility = (layerId: string) => {
    setLayers((prev) => prev.map((layer) => (layer.id === layerId ? { ...layer, visible: !layer.visible } : layer)))
  }

  const deleteTrait = (layerId: string, traitId: string) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, traits: layer.traits.filter((trait) => trait.id !== traitId) } : layer,
      ),
    )

    // Clear preview trait if it was the deleted one
    setPreviewTraits((prev) => {
      if (prev[layerId]?.id === traitId) {
        const { [layerId]: removed, ...rest } = prev
        return rest
      }
      return prev
    })
  }

  const resetSettings = () => {
    setCollectionSettings({
      name: "My collection",
      description: "Enter description",
      itemPrefix: "Output ex: 1",
      width: 600,
      height: 600,
      size: 100,
    })
    setShowSizeWarning(false)
  }

  // Layer renaming functions
  const startEditingLayer = (layerId: string, currentName: string) => {
    setEditingLayer(layerId)
    setEditingLayerName(currentName)
  }

  const saveLayerName = () => {
    if (editingLayer && editingLayerName.trim()) {
      setLayers((prev) =>
        prev.map((layer) => (layer.id === editingLayer ? { ...layer, name: editingLayerName.trim() } : layer)),
      )
    }
    setEditingLayer(null)
    setEditingLayerName("")
  }

  const cancelEditingLayer = () => {
    setEditingLayer(null)
    setEditingLayerName("")
  }

  // Drag and drop for layer reordering
  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayer(layerId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault()
    if (!draggedLayer || draggedLayer === targetLayerId) return

    setLayers((prev) => {
      const draggedIndex = prev.findIndex((l) => l.id === draggedLayer)
      const targetIndex = prev.findIndex((l) => l.id === targetLayerId)

      const newLayers = [...prev]
      const [draggedItem] = newLayers.splice(draggedIndex, 1)
      newLayers.splice(targetIndex, 0, draggedItem)

      // Update order values
      return newLayers.map((layer, index) => ({ ...layer, order: index }))
    })

    setDraggedLayer(null)
  }

  // Handle trait click for preview
  const handleTraitClick = (layerId: string, trait: Trait) => {
    setPreviewTraits((prev) => ({
      ...prev,
      [layerId]: trait,
    }))
  }

  // Calculate maximum possible NFTs
  const calculateMaxNFTs = () => {
    const layersWithTraits = layers.filter((layer) => layer.traits.length > 0)
    if (layersWithTraits.length === 0) return 0
    return layersWithTraits.reduce((total, layer) => total * layer.traits.length, 1)
  }

  // Generate unique NFT combinations
  const generateNFTCombinations = () => {
    const layersWithTraits = layers.filter((layer) => layer.traits.length > 0).sort((a, b) => a.order - b.order)

    if (layersWithTraits.length === 0) return []

    const targetSize = collectionSettings.size
    const maxPossible = calculateMaxNFTs()

    // If we want more NFTs than possible unique combinations, we'll need duplicates
    const needsUniqueOnly = targetSize <= maxPossible

    if (needsUniqueOnly) {
      // Generate all possible unique combinations first
      const allCombinations: { layerId: string; trait: Trait }[][] = []

      const generateAllCombinations = (layerIndex: number, currentCombination: { layerId: string; trait: Trait }[]) => {
        if (layerIndex >= layersWithTraits.length) {
          allCombinations.push([...currentCombination])
          return
        }

        const currentLayer = layersWithTraits[layerIndex]
        for (const trait of currentLayer.traits) {
          currentCombination.push({ layerId: currentLayer.id, trait })
          generateAllCombinations(layerIndex + 1, currentCombination)
          currentCombination.pop()
        }
      }

      generateAllCombinations(0, [])

      // Shuffle the combinations to randomize selection
      for (let i = allCombinations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[allCombinations[i], allCombinations[j]] = [allCombinations[j], allCombinations[i]]
      }

      // Take only the number we need
      const selectedCombinations = allCombinations.slice(0, targetSize)

      return selectedCombinations.map((traits, index) => ({
        id: index,
        traits,
        image: "", // Will be generated
      }))
    } else {
      // If we need more than possible unique combinations, use random selection
      const combinations: GeneratedNFT[] = []

      for (let i = 0; i < targetSize; i++) {
        const traits: { layerId: string; trait: Trait }[] = []

        // For each layer, select a random trait
        for (const layer of layersWithTraits) {
          const randomIndex = Math.floor(Math.random() * layer.traits.length)
          const selectedTrait = layer.traits[randomIndex]
          traits.push({
            layerId: layer.id,
            trait: selectedTrait,
          })
        }

        combinations.push({
          id: i,
          traits,
          image: "", // Will be generated
        })
      }

      return combinations
    }
  }

  const handleGenerateNFTs = () => {
    const maxPossible = calculateMaxNFTs()
    if (collectionSettings.size > maxPossible) {
      toast.error(
        `Collection size exceeds maximum combinations (${maxPossible})`,{
          description: "Please reduce the collection size to a value that is less than or equal to the maximum possible combinations.",
        }
      )
      return
    }
    setShowSizeWarning(false)

    // Generate NFT combinations with unique selection when possible
    const nfts = generateNFTCombinations()
    setGeneratedNFTs(nfts)
    setCurrentStep(2)
  }

  // Filter functions
  const toggleFilter = (layerId: string, traitId: string) => {
    setFilters((prev) => {
      const layerFilters = prev[layerId] || []
      const isSelected = layerFilters.includes(traitId)

      if (isSelected) {
        // Remove the trait from filters
        const newFilters = layerFilters.filter((id) => id !== traitId)
        if (newFilters.length === 0) {
          const { [layerId]: removed, ...rest } = prev
          return rest
        }
        return {
          ...prev,
          [layerId]: newFilters,
        }
      } else {
        // Add the trait to filters
        return {
          ...prev,
          [layerId]: [...layerFilters, traitId],
        }
      }
    })
  }

  // Filter NFTs based on selected filters
  const getFilteredNFTs = () => {
    if (Object.keys(filters).length === 0 || Object.values(filters).every((arr) => arr.length === 0)) {
      return generatedNFTs
    }

    return generatedNFTs.filter((nft) => {
      return Object.entries(filters).every(([layerId, traitIds]) => {
        if (traitIds.length === 0) return true
        const nftTrait = nft.traits.find((t) => t.layerId === layerId)
        return nftTrait && traitIds.includes(nftTrait.trait.id)
      })
    })
  }

  // Update NFT trait
  const updateNFTTrait = (nftId: number, layerId: string, newTrait: Trait) => {
    setGeneratedNFTs((prev) =>
      prev.map((nft) =>
        nft.id === nftId
          ? {
              ...nft,
              traits: nft.traits.map((t) => (t.layerId === layerId ? { ...t, trait: newTrait } : t)),
            }
          : nft,
      ),
    )

    // Update selected NFT if it's the one being edited
    if (selectedNFT && selectedNFT.id === nftId) {
      setSelectedNFT((prev) =>
        prev
          ? {
              ...prev,
              traits: prev.traits.map((t) => (t.layerId === layerId ? { ...t, trait: newTrait } : t)),
            }
          : null,
      )
    }
  }

  // Generate NFT image using canvas
  const generateNFTImage = async (nft: GeneratedNFT): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve("")
        return
      }

      canvas.width = collectionSettings.width
      canvas.height = collectionSettings.height

      const sortedTraits = nft.traits.sort((a, b) => {
        const layerA = layers.find((l) => l.id === a.layerId)
        const layerB = layers.find((l) => l.id === b.layerId)
        return (layerA?.order || 0) - (layerB?.order || 0)
      })

      let loadedImages = 0
      const totalImages = sortedTraits.length

      if (totalImages === 0) {
        resolve("")
        return
      }

      sortedTraits.forEach((traitData) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          loadedImages++

          if (loadedImages === totalImages) {
            resolve(canvas.toDataURL("image/png"))
          }
        }
        img.onerror = () => {
          loadedImages++
          if (loadedImages === totalImages) {
            resolve(canvas.toDataURL("image/png"))
          }
        }
        img.src = traitData.trait.image
      })
    })
  }

  // Generate metadata for NFT
  const generateNFTMetadata = (nft: GeneratedNFT) => {
    const attributes = nft.traits.map((traitData) => {
      const layer = layers.find((l) => l.id === traitData.layerId)
      return {
        trait_type: layer?.name || "Unknown",
        value: traitData.trait.name,
      }
    })

    return {
      name: `${collectionSettings.itemPrefix} #${nft.id}`,
      description: collectionSettings.description,
      image: `images/${nft.id}.png`,
      attributes,
    }
  }

  // Export NFTs as ZIP
  const exportNFTs = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Dynamic import of JSZip
      const JSZip = (await import("jszip")).default
      const zip = new JSZip()

      const imagesFolder = zip.folder("images")
      const metadataFolder = zip.folder("metadata")

      if (!imagesFolder || !metadataFolder) {
        throw new Error("Failed to create folders")
      }

      // Generate images and metadata for each NFT
      for (let i = 0; i < generatedNFTs.length; i++) {
        const nft = generatedNFTs[i]

        // Update progress
        setExportProgress(Math.round(((i + 1) / generatedNFTs.length) * 100))

        // Generate image
        const imageDataUrl = await generateNFTImage(nft)
        if (imageDataUrl) {
          // Convert data URL to blob
          const response = await fetch(imageDataUrl)
          const blob = await response.blob()
          imagesFolder.file(`${nft.id}.png`, blob)
        }

        // Generate metadata
        const metadata = generateNFTMetadata(nft)
        metadataFolder.file(`${nft.id}.json`, JSON.stringify(metadata, null, 2))

        // Small delay to prevent blocking
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" })

      // Download ZIP file
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${collectionSettings.name.replace(/\s+/g, "_")}_NFT_Collection.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  // Step navigation
  const handleStepClick = (step: number) => {
    if (step === 1) {
      setCurrentStep(1)
    } else if (step === 2 && generatedNFTs.length > 0) {
      setCurrentStep(2)
    } else if (step === 3 && generatedNFTs.length > 0) {
      setCurrentStep(3)
    } else if (step === 4 && uploadResults) {
      setCurrentStep(4)
    }
  }

  const totalTraits = layers.reduce((sum, layer) => sum + layer.traits.length, 0)
  const maxPossibleNFTs = calculateMaxNFTs()
  const filteredNFTs = getFilteredNFTs()

  // Handle upload completion and navigate to deploy step
  const handleUploadComplete = (results: any) => {
    console.log("Upload completed with results:", results)
    setUploadResults(results)
    setShowWeb3Modal(false) // Close the modal
    setCurrentStep(4) // Navigate to deploy step
  }

  const handleDeploy = (data: any) => {
    setDeploymentData(data)
    // Here you would typically call a smart contract deployment service
    console.log("Deploying with data:", data)
  }

  // Step content
  let stepContent = null;
  if (currentStep === 1) {
    stepContent = (
      <>
        <StepOne
          currentStep={currentStep}
          layers={layers}
          selectedLayer={selectedLayer}
          previewTraits={previewTraits}
          showSizeWarning={showSizeWarning}
          generatedNFTs={generatedNFTs}
          draggedLayer={draggedLayer}
          editingLayer={editingLayer}
          editingLayerName={editingLayerName}
          collectionSettings={collectionSettings}
          uploadResults={uploadResults}
          onStepClick={handleStepClick}
          onLayerSelect={setSelectedLayer}
          onLayerAdd={addLayer}
          onLayerDelete={deleteLayer}
          onLayerVisibilityToggle={toggleLayerVisibility}
          onLayerDragStart={handleDragStart}
          onLayerDragOver={handleDragOver}
          onLayerDrop={handleDrop}
          onLayerEditStart={startEditingLayer}
          onLayerEditSave={saveLayerName}
          onLayerEditCancel={cancelEditingLayer}
          onLayerNameChange={setEditingLayerName}
          onDrop={onDrop}
          onTraitClick={handleTraitClick}
          onTraitDelete={deleteTrait}
          onCollectionSettingsChange={setCollectionSettings}
          onCollectionSettingsReset={resetSettings}
          onGenerateNFTs={handleGenerateNFTs}
          calculateMaxNFTs={calculateMaxNFTs}
        />
        {/* Web3 Storage Modal */}
        {showWeb3Modal && (
          <Web3StorageModal
            isOpen={showWeb3Modal}
            onClose={() => setShowWeb3Modal(false)}
            generatedNFTs={generatedNFTs as any}
            layers={layers as any}
            collectionSettings={collectionSettings}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </>
    );
  } else if (currentStep === 2) {
    stepContent = (
      <>
        <div className="min-h-screen bg-background">
          {/* Main Content */}
          <div className="p-4">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
                {/* Left Sidebar - Filter */}
                <div className="col-span-3">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Filter by property
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">Selected: All</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {layers
                        .filter((layer) => layer.traits.length > 0)
                        .map((layer) => (
                          <div key={layer.id}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{layer.name}</span>
                              <span className="text-xs text-muted-foreground">{layer.traits.length}</span>
                            </div>
                            <div className="space-y-1">
                              {layer.traits.map((trait) => {
                                const isSelected = filters[layer.id]?.includes(trait.id) || false
                                const traitCount = generatedNFTs.filter((nft) =>
                                  nft.traits.some((t) => t.layerId === layer.id && t.trait.id === trait.id),
                                ).length
                                const percentage =
                                  generatedNFTs.length > 0 ? Math.round((traitCount / generatedNFTs.length) * 100) : 0

                                return (
                                  <div key={trait.id} className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      className="rounded"
                                      checked={isSelected}
                                      onChange={() => toggleFilter(layer.id, trait.id)}
                                    />
                                    <span className="text-xs flex-1">{trait.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {traitCount} ({percentage}%)
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Center - Collection Preview */}
                <div className="col-span-6">
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Collection preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {filteredNFTs.slice(0, 8).map((nft) => (
                          <div
                            key={nft.id}
                            className={`aspect-square border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors relative ${
                              selectedNFT?.id === nft.id ? "border-blue-500 ring-2 ring-blue-200" : ""
                            }`}
                            onClick={() => setSelectedNFT(nft)}
                          >
                            <div className="relative w-full h-full bg-muted">
                              {nft.traits
                                .sort((a, b) => {
                                  const layerA = layers.find((l) => l.id === a.layerId)
                                  const layerB = layers.find((l) => l.id === b.layerId)
                                  return (layerA?.order || 0) - (layerB?.order || 0)
                                })
                                .map((traitData, index) => (
                                  <img
                                    key={`${traitData.layerId}-${traitData.trait.id}`}
                                    src={traitData.trait.image || "/placeholder.svg"}
                                    alt={traitData.trait.name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    style={{ zIndex: index }}
                                  />
                                ))}
                            </div>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                              {nft.id}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center text-sm text-muted-foreground">
                        Page 1 of 1 (Showing: 0-{Math.min(filteredNFTs.length, 100)} items)
                      </div>

                      <div className="flex justify-center mt-4">
                        <Button variant="outline" size="sm">
                          1
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar - Item Details & Trait Selection */}
                <div className="col-span-3 space-y-4">
                {filteredNFTs.length > 0 && (
                <div className="flex gap-2">
                <Button className="w-full" onClick={() => setCurrentStep(3)}>Go to export</Button>
              </div>
              )}
                  <Card>
                    <CardHeader className="">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Item details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedNFT ? (
                        <div className="space-y-4">
                          <div className="aspect-square border rounded overflow-hidden">
                            <div className="relative w-full h-full bg-muted">
                              {selectedNFT.traits
                                .sort((a, b) => {
                                  const layerA = layers.find((l) => l.id === a.layerId)
                                  const layerB = layers.find((l) => l.id === b.layerId)
                                  return (layerA?.order || 0) - (layerB?.order || 0)
                                })
                                .map((traitData, index) => (
                                  <img
                                    key={`${traitData.layerId}-${traitData.trait.id}`}
                                    src={traitData.trait.image || "/placeholder.svg"}
                                    alt={traitData.trait.name}
                                    className="absolute inset-0 w-full h-full object-contain"
                                    style={{ zIndex: index }}
                                  />
                                ))}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-medium">NFT #{selectedNFT.id}</h3>
                            <div className="mt-2 space-y-1">
                              {selectedNFT.traits.map((traitData) => {
                                const layer = layers.find((l) => l.id === traitData.layerId)
                                return (
                                  <div key={`${traitData.layerId}-${traitData.trait.id}`} className="text-xs">
                                    <span className="font-medium">{layer?.name}:</span> {traitData.trait.name}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <div className="text-center text-sm text-muted-foreground">
                            <div className="w-16 h-16 mx-auto mb-2 bg-muted rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🖼️</span>
                            </div>
                            <div>Select an item to edit</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Select trait
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedNFT ? (
                        <div className="space-y-4">
                          <div className="text-xs text-muted-foreground mb-2">Select property to edit</div>
                          {layers
                            .filter((layer) => layer.traits.length > 0)
                            .sort((a, b) => a.order - b.order)
                            .map((layer) => {
                              const currentTrait = selectedNFT.traits.find((t) => t.layerId === layer.id)?.trait
                              return (
                                <div key={layer.id} className="space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground uppercase">
                                    {layer.name}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {layer.traits.map((trait) => {
                                      const isSelected = currentTrait?.id === trait.id
                                      const traitCount = generatedNFTs.filter((nft) =>
                                        nft.traits.some((t) => t.layerId === layer.id && t.trait.id === trait.id),
                                      ).length
                                      const percentage =
                                        generatedNFTs.length > 0
                                          ? Math.round((traitCount / generatedNFTs.length) * 100)
                                          : 0

                                      return (
                                        <div
                                          key={trait.id}
                                          className={`p-2 border rounded cursor-pointer transition-colors ${
                                            isSelected
                                              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                              : "border-border hover:bg-muted"
                                          }`}
                                          onClick={() => updateNFTTrait(selectedNFT.id, layer.id, trait)}
                                        >
                                          <div className="aspect-square rounded overflow-hidden mb-1">
                                            <img
                                              src={trait.image || "/placeholder.svg"}
                                              alt={trait.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <div className="text-xs text-center font-medium truncate" title={trait.name}>
                                            {trait.name}
                                          </div>
                                          <div className="text-xs text-center text-muted-foreground">
                                            Used in {traitCount} items ({percentage}%)
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}

                          <div className="flex gap-2 mt-4">
                            <Button className="w-full text-white bg-black hover:bg-gray-800">Apply Changes</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-sm text-muted-foreground">Select an NFT to modify traits</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>              
            </div>
          </div>
        </div>
        {/* Web3 Storage Modal */}
        {showWeb3Modal && (
          <Web3StorageModal
            isOpen={showWeb3Modal}
            onClose={() => setShowWeb3Modal(false)}
            generatedNFTs={generatedNFTs as any}
            layers={layers as any}
            collectionSettings={collectionSettings}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </>
    );
  } else if (currentStep === 3) {
    stepContent = (
      <>
        <ExportUploadStep
          currentStep={currentStep}
          generatedNFTs={generatedNFTs}
          layers={layers}
          collectionSettings={collectionSettings}
          uploadResults={uploadResults}
          isExporting={isExporting}
          exportProgress={exportProgress}
          onStepClick={handleStepClick}
          onExportNFTs={exportNFTs}
          onShowWeb3Modal={() => setShowWeb3Modal(true)}
        />
        {/* Web3 Storage Modal */}
        {showWeb3Modal && (
          <Web3StorageModal
            isOpen={showWeb3Modal}
            onClose={() => setShowWeb3Modal(false)}
            generatedNFTs={generatedNFTs as any}
            layers={layers as any}
            collectionSettings={collectionSettings}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </>
    );
  } else if (currentStep === 4) {
    stepContent = (
      <>
        <div className="min-h-screen bg-background">
          {/* Main Content */}
          <div className="p-4">
            <DeployCollection
              baseURI={uploadResults?.collectionURL || ""}
              imageURI={uploadResults?.imageFiles[0].url || ""}
              totalSupply={generatedNFTs.length}
              onDeploy={handleDeploy}
            />
          </div>
        </div>
      </>
    );
  }

  // Render header + step content
  return (
    <>
      <GeneratorHeader
        currentStep={currentStep}
        generatedNFTs={generatedNFTs}
        uploadResults={uploadResults}
        onStepClick={handleStepClick}
      />
      {stepContent}
    </>
  );
}
