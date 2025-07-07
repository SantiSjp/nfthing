"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCollectionById } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Collection {
  id: string
  name: string
  description: string
  itemCount: number
  price: string
  floorPrice: string
  totalSales: number
  likes: number
  image: string
  creator: string
  status: "open" | "closed"
}

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCollectionById(id)
      .then((c: any) => {
        if (!c) return setCollection(null)
        setCollection({
          id: String(c.id),
          name: c.name || "",
          description: c.description || "",
          itemCount: c.supply || 0,
          price: c.price || "0",
          floorPrice: c.floorPrice || "0",
          totalSales: c.sales || 0,
          likes: c.likes || 0,
          image: c.image || "/placeholder.svg?height=300&width=300",
          creator: c.creator || "",
          status: c.mintIsActive === false ? "closed" : "open",
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading collection...</div>
  }

  if (!collection) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Collection not found.</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800/50 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <img src="/logo_branca.png" alt="nfthing" className="h-10 w-30 object-contain" />
          <Button variant="ghost" onClick={() => router.back()} className="text-white">Back</Button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={collection.image || "/placeholder.svg"}
            alt={collection.name}
            className="w-full max-w-xs aspect-square object-cover rounded-lg"
          />
        </div>
        {/* Details Section */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{collection.name}</h2>
              <p className="text-blue-400 break-all">by {collection.creator}</p>
            </div>
            {collection.status === "open" ? (
              <Badge className="bg-yellow-600/80 text-yellow-100 border-0">Mint Open</Badge>
            ) : (
              <Badge className="bg-red-600/80 text-red-100 border-0">Mint Closed</Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-green-400 text-2xl font-bold">{collection.price} MON</p>
              <p className="text-gray-400 text-sm">Mint Price</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-white text-2xl font-bold">{collection.totalSales}</p>
              <p className="text-gray-400 text-sm">Total Sales</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-gray-300">{collection.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Supply: {collection.itemCount}</span>
              <span>{collection.likes} likes</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 