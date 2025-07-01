"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Trash2, Plus, GripVertical, Edit2, Check, X } from "lucide-react"

interface Layer {
  id: string
  name: string
  visible: boolean
  traits: any[]
  usage: number
  order: number
}

interface LayersPanelProps {
  layers: Layer[]
  selectedLayer: string
  draggedLayer: string | null
  editingLayer: string | null
  editingLayerName: string
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
}

export function LayersPanel({
  layers,
  selectedLayer,
  draggedLayer,
  editingLayer,
  editingLayerName,
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
}: LayersPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {layers
          .sort((a, b) => a.order - b.order)
          .map((layer) => (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => onLayerDragStart(e, layer.id)}
              onDragOver={onLayerDragOver}
              onDrop={(e) => onLayerDrop(e, layer.id)}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedLayer === layer.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-border hover:bg-muted"
              } ${draggedLayer === layer.id ? "opacity-50" : ""}`}
              onClick={() => onLayerSelect(layer.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    {editingLayer === layer.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editingLayerName}
                          onChange={(e) => onLayerNameChange(e.target.value)}
                          className="h-6 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") onLayerEditSave()
                            if (e.key === "Escape") onLayerEditCancel()
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onLayerEditSave()
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            onLayerEditCancel()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 group">
                        <div className="font-medium text-sm">{layer.name}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            onLayerEditStart(layer.id, layer.name)
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {layer.usage}% • {layer.traits.length}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerVisibilityToggle(layer.id)
                    }}
                  >
                    {layer.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onLayerDelete(layer.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

        <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent" onClick={onLayerAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Create new layer
        </Button>
      </CardContent>
    </Card>
  )
}
