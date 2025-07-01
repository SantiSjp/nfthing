// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { AlertTriangle, Upload, ExternalLink } from "lucide-react"
// import { Web3StorageSetup } from "./web3-storage-setup"
// import { NFTUploader } from "./nft-uploader"

// interface GeneratedNFT {
//   id: number
//   traits: { layerId: string; trait: { id: string; name: string; image: string; rarity: number } }[]
//   image: string
// }

// interface Layer {
//   id: string
//   name: string
//   visible: boolean
//   traits: { id: string; name: string; image: string; rarity: number }[]
//   usage: number
//   order: number
// }

// interface CollectionSettings {
//   name: string
//   description: string
//   itemPrefix: string
//   width: number
//   height: number
//   size: number
// }

// interface Web3StorageModalProps {
//   isOpen: boolean
//   onClose: () => void
//   generatedNFTs: GeneratedNFT[]
//   layers: Layer[]
//   collectionSettings: CollectionSettings
//   onUploadComplete?: (results: any) => void
// }

// export function Web3StorageModal({
//   isOpen,
//   onClose,
//   generatedNFTs,
//   layers,
//   collectionSettings,
//   onUploadComplete,
// }: Web3StorageModalProps) {
//   const [step, setStep] = useState<"warning" | "setup" | "ready">("warning")

//   const handleSetupComplete = () => {
//     setStep("ready")
//   }

//   const handleClose = () => {
//     setStep("warning")
//     onClose()
//   }

//   const handleProceedToSetup = () => {
//     setStep("setup")
//   }

//   const handleUploadComplete = (results: any) => {
//     // Close the modal and call the parent's upload complete handler
//     handleClose()
//     onUploadComplete?.(results)
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Upload className="h-5 w-5" />
//             Upload to Web3.Storage
//           </DialogTitle>
//         </DialogHeader>

//         {step === "warning" && (
//           <div className="space-y-6 py-4">
//             <div className="text-center">
//               <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mx-auto mb-4 flex items-center justify-center">
//                 <AlertTriangle className="w-8 h-8 text-orange-600" />
//               </div>
//               <h3 className="font-semibold mb-2">Account Required</h3>
//               <p className="text-sm text-muted-foreground">
//                 You need a Web3.Storage account to upload your NFT collection to IPFS. This service provides
//                 decentralized storage for your digital assets.
//               </p>
//             </div>

//             <Alert>
//               <AlertTriangle className="h-4 w-4" />
//               <AlertDescription>
//                 <strong>Important:</strong> Make sure you have created a Web3.Storage account before proceeding. The
//                 setup process will send a verification email to authenticate your account.
//               </AlertDescription>
//             </Alert>

//             <div className="space-y-3">
//               <div className="p-3 bg-muted rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-bold text-blue-600">1</span>
//                   </div>
//                   <div>
//                     <div className="text-sm font-medium">Create Account</div>
//                     <div className="text-xs text-muted-foreground">Sign up at Web3.Storage console</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-3 bg-muted rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-bold text-blue-600">2</span>
//                   </div>
//                   <div>
//                     <div className="text-sm font-medium">Verify Email</div>
//                     <div className="text-xs text-muted-foreground">Complete email verification process</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-3 bg-muted rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
//                     <span className="text-sm font-bold text-blue-600">3</span>
//                   </div>
//                   <div>
//                     <div className="text-sm font-medium">Upload NFTs</div>
//                     <div className="text-xs text-muted-foreground">Your collection will be stored on IPFS</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 className="flex-1 bg-transparent"
//                 onClick={() => window.open("https://console.web3.storage", "_blank")}
//               >
//                 <ExternalLink className="w-4 h-4 mr-2" />
//                 Create Account
//               </Button>
//               <Button onClick={handleProceedToSetup} className="flex-1">
//                 I have an account
//               </Button>
//             </div>

//             <div className="text-center">
//               <p className="text-xs text-muted-foreground">
//                 Don't have an account? Create one first, then return here to continue.
//               </p>
//             </div>
//           </div>
//         )}

//         {step === "setup" && (
//           <div className="space-y-4">
//             <Alert>
//               <AlertTriangle className="h-4 w-4" />
//               <AlertDescription>
//                 <strong>Email Verification Required:</strong> We'll send a verification email to authenticate your
//                 Web3.Storage account and enable uploads.
//               </AlertDescription>
//             </Alert>

//             <Web3StorageSetup onSetupComplete={handleSetupComplete} />
//           </div>
//         )}

//         {step === "ready" && (
//           <div className="space-y-4">
//             <NFTUploader
//               nfts={generatedNFTs}
//               layers={layers}
//               collectionSettings={collectionSettings}
//               onUploadComplete={handleUploadComplete}
//             />
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   )
// }
