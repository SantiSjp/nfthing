"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ModeToggle } from "@/components/toogle"
import { Download, Upload, Loader2, Link } from "lucide-react"

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

interface ExportUploadStepProps {
  currentStep: number
  generatedNFTs: GeneratedNFT[]
  layers: Layer[]
  collectionSettings: CollectionSettings
  uploadResults: any
  isExporting: boolean
  exportProgress: number
  onStepClick: (step: number) => void
  onExportNFTs: () => void
  onShowWeb3Modal: () => void
}

export function ExportUploadStep({
  currentStep,
  generatedNFTs,
  layers,
  collectionSettings,
  uploadResults,
  isExporting,
  exportProgress,
  onStepClick,
  onExportNFTs,
  onShowWeb3Modal,
}: ExportUploadStepProps) {
  return (
    <div className="min-h-screen bg-background">   

      {/* Main Content */}
      <div className="p-4">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6">
            {/* Collection Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{generatedNFTs.length}</div>
                    <div className="text-sm text-muted-foreground">NFTs Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {layers.filter((l) => l.traits.length > 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Layers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {layers.reduce((sum, layer) => sum + layer.traits.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Traits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {collectionSettings.width}x{collectionSettings.height}
                    </div>
                    <div className="text-sm text-muted-foreground">Resolution</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Local Export */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Export Locally
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download your NFT collection as a ZIP file containing images and metadata.
                  </p>

                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Generating NFTs... {exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} className="w-full" />
                    </div>
                  )}

                  <Button
                    onClick={onExportNFTs}
                    disabled={isExporting}
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download ZIP
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Web3 Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload to Web3.Storage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload your collection to IPFS via Web3.Storage for decentralized hosting.
                  </p>

                  {uploadResults && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-sm font-medium text-green-800 dark:text-green-200">
                        ✅ Upload successful!
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 break-all">
                        Collection URL: <a href={uploadResults.collectionURL} target="_blank" rel="noopener noreferrer" className="text-blue-500">{uploadResults.collectionURL}</a>
                      </div>
                    </div>
                  )}

                  <Button onClick={onShowWeb3Modal} className="w-full" disabled={uploadResults !== null}>
                    {uploadResults ? (
                      "✅ Uploaded to IPFS"
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Start Upload & Deploy Process
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            {uploadResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready for Deployment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your collection has been uploaded to IPFS. You can now proceed to deploy your smart contract.
                  </p>
                  <Button onClick={() => onStepClick(4)} className="w-full">
                    Proceed to Deploy →
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
