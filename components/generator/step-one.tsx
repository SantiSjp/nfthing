"use client"

import type React from "react"

import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, GripVertical, Pencil, Trash2, Plus, X, Check, Upload, ImageIcon } from "lucide-react"

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

interface StepOneProps {
  currentStep: number
  layers: Layer[]
  selectedLayer: string
  previewTraits: { [layerId: string]: Trait | null }
  showSizeWarning: boolean
  generatedNFTs: GeneratedNFT[]
  draggedLayer: string | null
  editingLayer: string | null
  editingLayerName: string
  collectionSettings: CollectionSettings
  uploadResults: any
  onStepClick: (step: number) => void
  onLayerSelect: (layerId: string) => void
  onLayerAdd: () => void
  onLayerDelete: (layerId: string) => void
  onLayerVisibilityToggle: (layerId: string) => void
  onLayerDragStart: (e: React.DragEvent, layerId: string) => void
  onLayerDragOver: (e: React.DragEvent) => void
  onLayerDrop: (e: React.DragEvent, targetLayerId: string) => void
  onLayerEditStart: (layerId: string, currentName: string) => void
  onLayerEditSave: () => void
  onLayerEditCancel: () => void
  onLayerNameChange: (name: string) => void
  onDrop: (acceptedFiles: File[]) => void
  onTraitClick: (layerId: string, trait: Trait) => void
  onTraitDelete: (layerId: string, traitId: string) => void
  onCollectionSettingsChange: (settings: CollectionSettings) => void
  onCollectionSettingsReset: () => void
  onGenerateNFTs: () => void
  calculateMaxNFTs: () => number
}

export function StepOne({
  currentStep,
  layers,
  selectedLayer,
  previewTraits,
  showSizeWarning,
  generatedNFTs,
  draggedLayer,
  editingLayer,
  editingLayerName,
  collectionSettings,
  uploadResults,
  onStepClick,
  onLayerSelect,
  onLayerAdd,
  onLayerDelete,
  onLayerVisibilityToggle,
  onLayerDragStart,
  onLayerDragOver,
  onLayerDrop,
  onLayerEditStart,
  onLayerEditSave,
  onLayerEditCancel,
  onLayerNameChange,
  onDrop,
  onTraitClick,
  onTraitDelete,
  onCollectionSettingsChange,
  onCollectionSettingsReset,
  onGenerateNFTs,
  calculateMaxNFTs,
}: StepOneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    },
    multiple: true,
  })

  const totalTraits = layers.reduce((sum, layer) => sum + layer.traits.length, 0)
  const maxPossibleNFTs = calculateMaxNFTs()
  const selectedLayerData = layers.find((layer) => layer.id === selectedLayer)

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-4">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
            {/* Left Sidebar - Layers */}
            <div className="col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Layers ({layers.length})
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={onLayerAdd}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedLayer === layer.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-border hover:bg-muted"
                      } ${draggedLayer === layer.id ? "opacity-50" : ""}`}
                      draggable
                      onDragStart={(e) => onLayerDragStart(e, layer.id)}
                      onDragOver={onLayerDragOver}
                      onDrop={(e) => onLayerDrop(e, layer.id)}
                      onClick={() => onLayerSelect(layer.id)}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-3 h-3 text-muted-foreground" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onLayerVisibilityToggle(layer.id)
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        {editingLayer === layer.id ? (
                          <div className="flex-1 flex items-center gap-1">
                            <Input
                              value={editingLayerName}
                              onChange={(e) => onLayerNameChange(e.target.value)}
                              className="h-6 text-xs"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") onLayerEditSave()
                                if (e.key === "Escape") onLayerEditCancel()
                              }}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={onLayerEditSave} className="h-6 w-6 p-0">
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={onLayerEditCancel} className="h-6 w-6 p-0">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 text-xs font-medium">{layer.name}</span>
                            <span className="text-xs text-muted-foreground">{layer.traits.length}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onLayerEditStart(layer.id, layer.name)
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            {layers.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onLayerDelete(layer.id)
                                }}
                                className="text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total traits:</span>
                    <span className="font-medium">{totalTraits}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max NFTs:</span>
                    <span className="font-medium">{maxPossibleNFTs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Collection size:</span>
                    <span className="font-medium">{collectionSettings.size}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center - Upload Area */}
            <div className="col-span-6">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Upload traits for: {selectedLayerData?.name || "Select a layer"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="h-full flex flex-col">
                    {/* Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
                        isDragActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium">
                          {isDragActive ? "Drop the files here..." : "Drag & drop images here"}
                        </p>
                        <p className="text-sm text-muted-foreground">or click to select files (PNG, JPG, GIF, SVG)</p>
                        <p className="text-xs text-muted-foreground">Max file size: 2MB per image</p>
                      </div>
                    </div>

                    {/* Traits Grid */}
                    {selectedLayerData && selectedLayerData.traits.length > 0 && (
                      <div className="flex-1 overflow-auto">
                        <div className="grid grid-cols-4 gap-3">
                          {selectedLayerData.traits.map((trait) => (
                            <div
                              key={trait.id}
                              className="group relative aspect-square border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                              onClick={() => onTraitClick(selectedLayer, trait)}
                            >
                              <img
                                src={trait.image || "/placeholder.svg"}
                                alt={trait.name}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-1">
                                <p className="text-xs font-medium truncate" title={trait.name}>
                                  {trait.name}
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onTraitDelete(selectedLayer, trait.id)
                                }}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {selectedLayerData && selectedLayerData.traits.length === 0 && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-muted-foreground">
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">No traits uploaded</p>
                          <p className="text-sm">Upload some images to get started</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar - Preview & Settings */}
            <div className="col-span-3 space-y-4">
              {/* Small Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square border rounded-lg overflow-hidden bg-muted mb-3">
                    <div className="relative w-full h-full">
                      {layers
                        .filter((layer) => layer.visible && previewTraits[layer.id])
                        .sort((a, b) => a.order - b.order)
                        .map((layer, index) => {
                          const trait = previewTraits[layer.id]
                          if (!trait) return null
                          return (
                            <img
                              key={`${layer.id}-${trait.id}`}
                              src={trait.image || "/placeholder.svg"}
                              alt={trait.name}
                              className="absolute inset-0 w-full h-full object-contain"
                              style={{ zIndex: index }}
                            />
                          )
                        })}
                      {layers.filter((layer) => layer.visible && previewTraits[layer.id]).length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-xs">Click traits to preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Traits List */}
                  <div className="space-y-1">
                    {layers
                      .filter((layer) => layer.visible)
                      .sort((a, b) => a.order - b.order)
                      .map((layer) => {
                        const trait = previewTraits[layer.id]
                        return (
                          <div key={layer.id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{layer.name}:</span>
                            <span className="font-medium">{trait ? trait.name : "None"}</span>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Collection Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Collection Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Collection Name</label>
                    <Input
                      value={collectionSettings.name}
                      onChange={(e) => onCollectionSettingsChange({ ...collectionSettings, name: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Input
                      value={collectionSettings.description}
                      onChange={(e) =>
                        onCollectionSettingsChange({ ...collectionSettings, description: e.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Width</label>
                      <Input
                        type="number"
                        value={collectionSettings.width}
                        onChange={(e) =>
                          onCollectionSettingsChange({
                            ...collectionSettings,
                            width: Number.parseInt(e.target.value) || 600,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Height</label>
                      <Input
                        type="number"
                        value={collectionSettings.height}
                        onChange={(e) =>
                          onCollectionSettingsChange({
                            ...collectionSettings,
                            height: Number.parseInt(e.target.value) || 600,
                          })
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Collection Size</label>
                    <Input
                      type="number"
                      value={collectionSettings.size}
                      onChange={(e) =>
                        onCollectionSettingsChange({
                          ...collectionSettings,
                          size: Number.parseInt(e.target.value) || 100,
                        })
                      }
                      className="h-8 text-sm"
                    />
                    {showSizeWarning && (
                      <p className="text-xs text-red-500">
                        Collection size exceeds maximum possible combinations ({maxPossibleNFTs})
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onCollectionSettingsReset}
                      className="flex-1 bg-transparent"
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={onGenerateNFTs}
                disabled={totalTraits === 0}
                size="lg"
              >
                Generate NFTs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
