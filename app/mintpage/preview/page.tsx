"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function MintingPreviewPage() {
  const router = useRouter();
  const [mintingData, setMintingData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem("mintingPreviewData");
    if (data) {
      setMintingData(JSON.parse(data));
    }
  }, []);

  if (!mintingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">No preview data found.</p>
        <Button onClick={() => router.push("/mintpage")}>Back to Edit</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-2 py-8">
      <div className="max-w-2xl w-full mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => router.push("/mintpage")}>Back to Edit</Button>
        <div
          className="relative rounded-lg overflow-hidden shadow-lg"
          style={{
            backgroundColor: mintingData.showBackground ? mintingData.backgroundColor : 'transparent',
            backgroundImage: mintingData.showBackground && mintingData.backgroundImage ? `url(${mintingData.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '400px',
          }}
        >
          {/* Layout-specific content */}
          {mintingData.layout === "Classic" && (
            <div className="p-6 text-center">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-4">{mintingData.nftName}</h1>
                <div className="flex justify-center space-x-4 mb-6">
                  <Badge variant="secondary">Monad Testnet</Badge>
                  <Badge variant={mintingData.mintingStage === "Whitelisted" ? "default" : "secondary"}>
                    {mintingData.mintingStage}
                  </Badge>
                  <Badge variant={mintingData.mintingStatus === "Started" ? "default" : "secondary"}>
                    {mintingData.mintingStatus}
                  </Badge>
                </div>
              </div>
              {mintingData.nftImage && (
                <div className="mb-8">
                  <img
                    src={mintingData.nftImage}
                    alt="NFT"
                    style={{ width: mintingData.imageSize, height: mintingData.imageSize }}
                    className="mx-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{mintingData.mintedCount}</div>
                  <div className="text-sm text-gray-300">Total Minted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{mintingData.userCount}</div>
                  <div className="text-sm text-gray-300">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{mintingData.price} MON</div>
                  <div className="text-sm text-gray-300">Price</div>
                </div>
              </div>
              <Button className="px-8 py-3 text-lg">
                <CheckCircle className="w-5 h-5 mr-2" />
                Mint Now
              </Button>
            </div>
          )}
          {mintingData.layout === "Minimalist" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">{mintingData.nftName}</h1>
                <Badge variant="secondary">{mintingData.price} MON</Badge>
              </div>
              {mintingData.nftImage && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={mintingData.nftImage}
                    alt="NFT"
                    style={{ width: mintingData.imageSize * 0.8, height: mintingData.imageSize * 0.8 }}
                    className="rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Network</span>
                  <span>Monad Testnet</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Status</span>
                  <span>{mintingData.mintingStatus}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Minted</span>
                  <span>{mintingData.mintedCount} / {mintingData.totalSupply}</span>
                </div>
              </div>
              <Button className="w-full mt-6">
                Mint
              </Button>
            </div>
          )}
          {mintingData.layout === "Showcase" && (
            <div className="relative h-full">
              {mintingData.nftImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={mintingData.nftImage}
                    alt="NFT"
                    style={{ width: mintingData.imageSize, height: mintingData.imageSize }}
                    className="rounded-lg shadow-2xl"
                  />
                </div>
              )}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-6">
                  <h1 className="text-2xl font-bold text-white mb-2">{mintingData.nftName}</h1>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-sm text-gray-300">
                      <span>{mintingData.mintedCount} minted</span>
                      <span>{mintingData.price} MON</span>
                    </div>
                    <Button>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mint
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 