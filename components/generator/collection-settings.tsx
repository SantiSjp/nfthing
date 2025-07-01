"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CollectionSettings {
  name: string
  description: string
  itemPrefix: string
  width: number
  height: number
  size: number
}

interface CollectionSettingsPanelProps {
  collectionSettings: CollectionSettings
  maxPossibleNFTs: number
  showSizeWarning: boolean
  onSettingsChange: (settings: CollectionSettings) => void
  onReset: () => void
}

export function CollectionSettingsPanel({
  collectionSettings,
  maxPossibleNFTs,
  showSizeWarning,
  onSettingsChange,
  onReset,
}: CollectionSettingsPanelProps) {
  const updateSetting = (field: keyof CollectionSettings, value: string | number) => {
    onSettingsChange({
      ...collectionSettings,
      [field]: value,
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          Collection settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="collection-name" className="text-xs">
            Collection name
          </Label>
          <Input
            id="collection-name"
            value={collectionSettings.name}
            onChange={(e) => updateSetting("name", e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="collection-description" className="text-xs">
            Collection description
          </Label>
          <Textarea
            id="collection-description"
            value={collectionSettings.description}
            onChange={(e) => updateSetting("description", e.target.value)}
            className="mt-1 h-20"
          />
        </div>

        <div>
          <Label htmlFor="item-prefix" className="text-xs">
            Item name prefix
          </Label>
          <Input
            id="item-prefix"
            value={collectionSettings.itemPrefix}
            onChange={(e) => updateSetting("itemPrefix", e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width" className="text-xs">
              Width
            </Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                id="width"
                type="number"
                value={collectionSettings.width}
                onChange={(e) => updateSetting("width", Number.parseInt(e.target.value) || 0)}
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>
          <div>
            <Label htmlFor="height" className="text-xs">
              Height
            </Label>
            <div className="flex items-center gap-1 mt-1">
              <Input
                id="height"
                type="number"
                value={collectionSettings.height}
                onChange={(e) => updateSetting("height", Number.parseInt(e.target.value) || 0)}
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="collection-size" className="text-xs">
            Collection size
          </Label>
          <Input
            id="collection-size"
            type="number"
            value={collectionSettings.size}
            onChange={(e) => updateSetting("size", Number.parseInt(e.target.value) || 0)}
            className={`mt-1 ${showSizeWarning ? "border-orange-500 focus:border-orange-500" : ""}`}
          />
          {maxPossibleNFTs > 0 && (
            <div className="text-xs text-muted-foreground mt-1">Max possible: {maxPossibleNFTs} NFTs</div>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onReset} className="w-full bg-transparent">
          Reset
        </Button>
      </CardContent>
    </Card>
  )
}
