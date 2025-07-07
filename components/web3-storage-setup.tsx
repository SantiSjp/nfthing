"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { web3StorageClient } from "@/lib/web3-storage"

interface Web3StorageSetupProps {
  onSetupComplete: () => void
}

export function Web3StorageSetup({ onSetupComplete }: Web3StorageSetupProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"email" | "complete">("email")

  const handleEmailSubmit = async () => {
    if (!email) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Autenticando com email:", email)
      //const success = await web3StorageClient.authenticate(email as `${string}@${string}`)
      const success = true
      console.log("Resultado da autenticação:", success)

      if (success) {
        await web3StorageClient.InitSpace()
        setStep("complete")
        setTimeout(() => {
          onSetupComplete()
        }, 2000)
      } else {
        throw new Error("Authentication failed")
      }
    } catch (err) {
      console.error("Erro ao autenticar:", err)
      setError("Failed to send verification email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <CardTitle>Setup Web3.Storage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "email" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && email) {
                    handleEmailSubmit()
                  }
                }}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You'll need a Web3.Storage account to upload your NFTs to IPFS.
                <a
                  href="https://console.web3.storage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-1"
                >
                  Create one here <ExternalLink className="w-3 h-3" />
                </a>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handleEmailSubmit} disabled={!email || isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Waiting for verification email...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </>
        )}

        {step === "complete" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Setup Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your Web3.Storage account is ready. You can now upload your NFTs to IPFS.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
