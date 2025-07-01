"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Copy, AlertCircle, Loader2 } from "lucide-react"
import { web3StorageClient } from "@/lib/web3-storage"

interface GeneratedNFT {
  id: number
  traits: { layerId: string; trait: { id: string; name: string; image: string; rarity: number } }[]
  image: string
}

interface Layer {
  id: string
  name: string
  visible: boolean
  traits: { id: string; name: string; image: string; rarity: number }[]
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

interface NFTUploaderProps {
  nfts: GeneratedNFT[]
  layers: Layer[]
  collectionSettings: CollectionSettings
  onUploadComplete: (results: UploadResults) => void
}

interface UploadResults {
  collectionCID: string
  collectionURL: string
  metadataFiles: { tokenId: number; cid: string; url: string }[]
  imageFiles: { tokenId: number; cid: string; url: string }[]
}

export function NFTUploader({ nfts, layers, collectionSettings, onUploadComplete }: NFTUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<string>("")
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateMetadata = (nft: GeneratedNFT, imageUrl: string) => {
    const attributes = nft.traits.map((traitData) => {
      const layer = layers.find((l) => l.id === traitData.layerId)
      return {
        trait_type: layer?.name || "Unknown",
        value: traitData.trait.name,
      }
    })

    return {
      name: `${collectionSettings.itemPrefix} #${nft.id}`,
      image: imageUrl,
      attributes
    }
  }

  const createCompositeImage = async (nft: GeneratedNFT): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        resolve(new File([], `${nft.id}.png`, { type: "image/png" }))
        return
      }

      canvas.width = collectionSettings.width
      canvas.height = collectionSettings.height

      // Set white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const sortedTraits = nft.traits.sort((a, b) => {
        const layerA = layers.find((l) => l.id === a.layerId)
        const layerB = layers.find((l) => l.id === b.layerId)
        return (layerA?.order || 0) - (layerB?.order || 0)
      })

      let loadedImages = 0

      if (sortedTraits.length === 0) {
        canvas.toBlob((blob) => {
          resolve(new File([blob!], `${nft.id}.png`, { type: "image/png" }))
        })
        return
      }

      sortedTraits.forEach((traitData) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          loadedImages++

          if (loadedImages === sortedTraits.length) {
            canvas.toBlob((blob) => {
              resolve(new File([blob!], `${nft.id}.png`, { type: "image/png" }))
            })
          }
        }
        img.onerror = () => {
          loadedImages++
          if (loadedImages === sortedTraits.length) {
            canvas.toBlob((blob) => {
              resolve(new File([blob!], `${nft.id}.png`, { type: "image/png" }))
            })
          }
        }
        img.src = traitData.trait.image
      })
    })
  }

  const handleUpload = async () => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Step 1: Generate images
      setCurrentStep("Generating images...")
      const imageFiles: File[] = []

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]
        const imageFile = await createCompositeImage(nft)
        imageFiles.push(new File([imageFile], `${nft.id}.png`, { type: "image/png" }))
        setUploadProgress(((i + 1) / nfts.length) * 25)
      }

      // Step 2: Upload images to IPFS
      setCurrentStep("Uploading images to IPFS...")
      const imagesResult = await web3StorageClient.uploadDirectory(imageFiles, (progress) => {
        setUploadProgress(25 + progress.percentage * 0.25)
      })
      const imagesCID = imagesResult.cid
      const imagesBaseUrl = `https://${imagesCID}.ipfs.w3s.link/`

      // Step 3: Generate metadata files
      setCurrentStep("Generating metadata files...")
      const metadataFiles: File[] = []

      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]
        const imageUrl = `ipfs://${imagesCID}/${nft.id}.png`
        const metadata = generateMetadata(nft, imageUrl)
        const jsonString = JSON.stringify(metadata, null, 2)
        metadataFiles.push(new File([jsonString], `${nft.id}.json`, { type: "application/json" }))
        setUploadProgress(50 + ((i + 1) / nfts.length) * 25)
      }

      // Step 4: Upload metadata to IPFS
      setCurrentStep("Uploading metadata to IPFS...")
      const metadataResult = await web3StorageClient.uploadDirectory(metadataFiles, (progress) => {
        setUploadProgress(75 + progress.percentage * 0.25)
      })
      const metadataCID = metadataResult.cid
      const metadataBaseUrl = `https://${metadataCID}.ipfs.w3s.link/`

      setUploadProgress(100)
      setCurrentStep("Upload complete!")

      const imageFilesResult = nfts.map((nft) => ({
        tokenId: nft.id,
        cid: imagesCID,
        url: `${imagesBaseUrl}${nft.id}.png`,
      }))

      const metadataFilesResult = nfts.map((nft) => ({
        tokenId: nft.id,
        cid: metadataCID,
        url: `${metadataBaseUrl}${nft.id}.json`,
      }))

      const results: UploadResults = {
        collectionCID: metadataCID,
        collectionURL: metadataBaseUrl,
        metadataFiles: metadataFilesResult,
        imageFiles: imageFilesResult,
      }

      setUploadResults(results)
      onUploadComplete(results)
    } catch (err) {
      console.error("Upload failed:", err)
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (uploadResults) {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your NFT collection has been successfully uploaded to IPFS via Web3.Storage.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Collection Base URI</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                {uploadResults.collectionURL}
              </code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(uploadResults.collectionURL)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{uploadResults.imageFiles.length}</div>
              <div className="text-xs text-blue-600">Images</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-xl font-bold text-green-600">{uploadResults.metadataFiles.length}</div>
              <div className="text-xs text-green-600">Metadata</div>
            </div>
          </div>
        </div>

        <Button onClick={() => onUploadComplete(uploadResults)} className="w-full">
          Continue to Deploy
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="font-medium">Ready to upload {nfts.length} NFTs</p>
        <p className="text-sm text-muted-foreground">Your collection will be stored permanently on IPFS</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <div className="font-bold">{nfts.length}</div>
          <div className="text-xs text-muted-foreground">NFTs</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="font-bold">{layers.filter((l) => l.traits.length > 0).length}</div>
          <div className="text-xs text-muted-foreground">Layers</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="font-bold">{layers.reduce((acc, l) => acc + l.traits.length, 0)}</div>
          <div className="text-xs text-muted-foreground">Traits</div>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentStep}</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleUpload} disabled={isUploading} className="w-full" size="lg">
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          "Upload to IPFS"
        )}
      </Button>
    </div>
  )
}
