"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Rocket, AlertTriangle, Info, Wallet, DollarSign, Hash, Globe, Users, Crown, Loader2 } from "lucide-react"
import { useCreateCollection } from "@/hooks/useCreateCollection"
import { parseUnits } from "viem/utils"
import { toast } from 'sonner';
import { insertCollection } from "@/lib/supabase";
import { useAccount } from "wagmi";

interface DeployCollectionProps {
  baseURI: string
  totalSupply: number
  onDeploy: (deploymentData: DeploymentData) => void
}

interface DeploymentData {
  name: string
  symbol: string
  baseURI: string
  royaltyBps: number
  royaltyReceiver: string
  maxSupply: number
  price: string
  maxPerWallet: number
}

export function DeployCollection({ baseURI, totalSupply, onDeploy }: DeployCollectionProps) {
  const [formData, setFormData] = useState<DeploymentData>({
    name: "My NFT Collection",
    symbol: "MNC",
    baseURI: baseURI,
    royaltyBps: 500, // 5%
    royaltyReceiver: "",
    maxSupply: totalSupply,
    price: "0.01",
    maxPerWallet: 10,
  })

  const [isDeploying, setIsDeploying] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [txHash, setTxHash] = useState<string | null>(null)

  const { createCollection, isPending } = useCreateCollection()
  const { address } = useAccount();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Collection name is required"
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = "Symbol is required"
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = "Symbol should be 10 characters or less"
    }

    if (!formData.baseURI.trim()) {
      newErrors.baseURI = "Base URI is required"
    }

    if (formData.royaltyBps < 0 || formData.royaltyBps > 1000) {
      newErrors.royaltyBps = "Royalty must be between 0 and 1000 BPS (0-10%)"
    }

    if (!formData.royaltyReceiver.trim()) {
      newErrors.royaltyReceiver = "Royalty receiver address is required"
    } else if (!formData.royaltyReceiver.match(/^0x[a-fA-F0-9]{40}$/)) {
      newErrors.royaltyReceiver = "Invalid Ethereum address format"
    }

    if (formData.maxSupply <= 0) {
      newErrors.maxSupply = "Max supply must be greater than 0"
    }

    if (Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than 0"
    }

    if (formData.maxPerWallet <= 0) {
      newErrors.maxPerWallet = "Max per wallet must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDeploy = async (e: React.FormEvent) => {
    if (!validateForm()) return
    e.preventDefault();

    toast.dismiss();
    const loadingToast = toast.loading('Deploying collection...');
    setIsDeploying(true)
    setErrors({})

    try {
      const txHash = await createCollection({
        ...formData,
        price: parseUnits(formData.price.toString(), 18),
      })
      setTxHash(txHash)
      toast.dismiss(loadingToast);
      toast.success('Collection deployed successfully!', {
        duration: 4000,
        icon: '✅',
      });
      // Salvar no Supabase
      await insertCollection({
        name: formData.name,
        symbol: formData.symbol,
        baseUri: formData.baseURI,
        royalty: formData.royaltyBps.toString(),
        price: formData.price,
        supply: formData.maxSupply,
        maxPerWallet: formData.maxPerWallet,
        created_at: new Date().toISOString(),
        creator: address,
      });
      onDeploy(formData)
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error('Failed to deploy collection.');
      setErrors({ general: err.message || "Erro ao fazer deploy" })
    } finally {
      setIsDeploying(false)
    }
  }

  const updateFormData = (field: keyof DeploymentData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Rocket className="w-9 h-9 text-purple-600 drop-shadow" />
          <h1 className="text-4xl font-extrabold tracking-tight">Deploy Collection</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Configure your smart contract parameters and deploy your NFT collection to the blockchain
        </p>
      </div>

      {/* Deployment Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Collection Details */}
          <Card className="shadow-lg border-2 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Hash className="w-5 h-5 text-blue-400" />
                Collection Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Label htmlFor="name">Collection Name *</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Ex: My Awesome NFTs"
                      className={`pl-10 ${errors.name ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Hash className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name}</p>}
                </div>

                <div className="relative">
                  <Label htmlFor="symbol">Symbol *</Label>
                  <div className="relative">
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => updateFormData("symbol", e.target.value.toUpperCase())}
                      placeholder="Ex: MAN"
                      maxLength={10}
                      className={`pl-10 ${errors.symbol ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Hash className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.symbol && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.symbol}</p>}
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="baseURI">Base URI *</Label>
                <div className="relative">
                  <Input
                    id="baseURI"
                    value={formData.baseURI}
                    onChange={(e) => updateFormData("baseURI", e.target.value)}
                    placeholder="https://your-metadata-url.com/"
                    className={`pl-10 ${errors.baseURI ? "border-2 border-red-500 animate-shake" : ""}`}
                  />
                  <span className="absolute left-3 top-2.5 text-zinc-400">
                    <Globe className="w-4 h-4" />
                  </span>
                </div>
                {errors.baseURI && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.baseURI}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  This URL will be used to fetch metadata for each NFT
                </p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Royalty Settings */}
          <Card className="shadow-lg border-2 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Crown className="w-5 h-5 text-yellow-500" />
                Royalty Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Label htmlFor="royaltyBps">Royalty BPS *</Label>
                  <div className="relative">
                    <Input
                      id="royaltyBps"
                      type="number"
                      value={formData.royaltyBps}
                      onChange={(e) => updateFormData("royaltyBps", Number.parseInt(e.target.value) || 0)}
                      placeholder="500"
                      min="0"
                      max="1000"
                      className={`pl-10 ${errors.royaltyBps ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Crown className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.royaltyBps && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.royaltyBps}</p>}
                  <p className="text-xs text-muted-foreground mt-1">500 BPS = 5% royalty (max 1000 BPS = 10%)</p>
                </div>

                <div className="relative">
                  <Label htmlFor="royaltyReceiver">Royalty Receiver *</Label>
                  <div className="relative">
                    <Input
                      id="royaltyReceiver"
                      value={formData.royaltyReceiver}
                      onChange={(e) => updateFormData("royaltyReceiver", e.target.value)}
                      placeholder="0x742d35Cc6634C0532925a3b8D4C9db96"
                      className={`pl-10 ${errors.royaltyReceiver ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Wallet className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.royaltyReceiver && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.royaltyReceiver}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    Ethereum address that will receive royalty payments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Minting Configuration */}
          <Card className="shadow-lg border-2 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5 text-green-500" />
                Minting Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative">
                  <Label htmlFor="maxSupply">Max Supply *</Label>
                  <div className="relative">
                    <Input
                      id="maxSupply"
                      type="number"
                      value={formData.maxSupply}
                      onChange={(e) => updateFormData("maxSupply", Number.parseInt(e.target.value) || 0)}
                      placeholder="10000"
                      min="1"
                      className={`pl-10 ${errors.maxSupply ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.maxSupply && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.maxSupply}</p>}
                </div>

                <div className="relative">
                  <Label htmlFor="price">Price (MON) *</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      value={formData.price}
                      onChange={(e) => updateFormData("price", e.target.value)}
                      placeholder="0.01"
                      min="0"
                      className={`pl-10 ${errors.price ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.price}</p>}
                </div>

                <div className="relative">
                  <Label htmlFor="maxPerWallet">Max Per Wallet *</Label>
                  <div className="relative">
                    <Input
                      id="maxPerWallet"
                      type="number"
                      value={formData.maxPerWallet}
                      onChange={(e) => updateFormData("maxPerWallet", Number.parseInt(e.target.value) || 0)}
                      placeholder="10"
                      min="1"
                      className={`pl-10 ${errors.maxPerWallet ? "border-2 border-red-500 animate-shake" : ""}`}
                    />
                    <span className="absolute left-3 top-2.5 text-zinc-400">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  {errors.maxPerWallet && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.maxPerWallet}</p>}
                </div>
              </div>

              {formData.maxSupply !== totalSupply && (
                <Alert className=" border-yellow-300">
                  <Info className="h-4 w-4 text-yellow-600" />
                  <AlertDescription>
                    <strong>Recommendation:</strong> Your max supply ({formData.maxSupply}) differs from your generated
                    NFTs ({totalSupply}). Consider setting max supply to {totalSupply} to match your collection size.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8 relative">
          <div className="sticky top-6 z-10">
            <Button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-6 text-lg font-bold shadow-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Deploying Contract...
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  {address ? 'Deploy Collection' : 'Connect Wallet'}
                </>
              )}
            </Button>
            {txHash && (
              <p className="text-xs text-green-400 text-center mt-2">
                <a
                  href={`https://testnet.monadexplorer.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-green-300"
                >
                  View transaction on Explorer
                </a>
              </p>
            )}
          </div> 

          {/* Deployment Summary */}
          <Card className=" border-zinc-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Deployment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collection:</span>
                  <span className="font-medium">{formData.name || "Not set"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">{formData.symbol || "Not set"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Supply:</span>
                  <span className="font-medium">{formData.maxSupply.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mint Price:</span>
                  <span className="font-medium">{formData.price} MON</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Royalty:</span>
                  <span className="font-medium">{(formData.royaltyBps / 100).toFixed(1)}%</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm font-medium">Estimated Revenue</div>
                <div className="text-2xl font-bold text-green-500">
                  {(formData.maxSupply * Number.parseFloat(formData.price)).toFixed(2)} MON
                </div>
                <div className="text-xs text-muted-foreground">
                  If all {formData.maxSupply.toLocaleString()} NFTs are minted
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Info */}
          <Card className="border-2 border-zinc-700 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                Deployment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-pink-500" />
                <span>Deploy fee: <span className="font-semibold">0.001 MON</span></span>
              </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-500" />
                  <span>ERC-721A Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <span>IPFS Metadata</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Public Minting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span>EIP-2981 Royalties</span>
                </div>                
              </div>
            </CardContent>
          </Card>         
        </div>
      </div>
    </div>
  )
}
