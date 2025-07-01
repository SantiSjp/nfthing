"use client"

import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon } from "lucide-react"

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

interface UploadAreaProps {
  selectedLayer: string
  layers: Layer[]
  onDrop: (acceptedFiles: File[]) => void
  onTraitClick: (layerId: string, trait: Trait) => void
  onTraitDelete: (layerId: string, traitId: string) => void
}

export function UploadArea({ selectedLayer, layers = [], onDrop, onTraitClick, onTraitDelete }: UploadAreaProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    },
    multiple: true,
  })

  const selectedLayerData = layers.find((layer) => layer.id === selectedLayer)
  const traitCount = selectedLayerData?.traits?.length || 0

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          Upload traits for: {selectedLayerData?.name || "Select a layer"}
          {traitCount > 0 && <span className="text-muted-foreground">({traitCount})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full flex flex-col">
          {/* Upload Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${
              isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium">{isDragActive ? "Drop the files here..." : "Drag & drop images here"}</p>
              <p className="text-sm text-muted-foreground">or click to select files (PNG, JPG, GIF, SVG)</p>
              <p className="text-xs text-muted-foreground">Max file size: 2MB per image</p>
            </div>
          </div>

          {/* Traits Grid */}
          {selectedLayerData && selectedLayerData.traits && selectedLayerData.traits.length > 0 && (
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-3 gap-3">
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
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTraitDelete(selectedLayer, trait.id)
                      }}
                      className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {selectedLayerData && (!selectedLayerData.traits || selectedLayerData.traits.length === 0) && (
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
  )
}
