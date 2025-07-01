"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Layer {
  id: string
  name: string
  visible: boolean
  traits: any[]
  usage: number
  order: number
}

interface PreviewPanelProps {
  layers: Layer[]
  previewTraits: { [layerId: string]: any }
  maxPossibleNFTs: number
}

export function PreviewPanel({ layers, previewTraits, maxPossibleNFTs }: PreviewPanelProps) {
  const createLayeredPreview = () => {
    const visibleLayers = layers
      .filter((layer) => layer.visible && layer.traits.length > 0)
      .sort((a, b) => a.order - b.order)

    if (visibleLayers.length === 0) return null

    return (
      <div className="relative w-full h-full">
        {visibleLayers.map((layer, index) => {
          const previewTrait = previewTraits[layer.id]
          const trait = previewTrait || layer.traits[Math.floor(Math.random() * layer.traits.length)]
          return (
            <div key={layer.id} className="absolute inset-0" style={{ zIndex: index }}>
              <img
                src={trait.image || "/placeholder.svg"}
                alt={`${layer.name} - ${trait.name}`}
                className="w-full h-full object-contain"
              />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Layers preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square border rounded bg-muted overflow-hidden">
          {createLayeredPreview() || (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-sm text-muted-foreground">
                <div>Add traits to layers</div>
                <div className="text-xs mt-1">to see preview</div>
              </div>
            </div>
          )}
        </div>

        {/* Max NFTs Info */}
        {maxPossibleNFTs > 0 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-800 dark:text-green-200">
              You can make {maxPossibleNFTs} NFTs with {layers.filter((l) => l.traits.length > 0).length} layers
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Current combination:{" "}
              {layers
                .filter((l) => l.traits.length > 0)
                .map((l) => l.traits.length)
                .join(" × ")}{" "}
              = {maxPossibleNFTs} unique NFTs
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
