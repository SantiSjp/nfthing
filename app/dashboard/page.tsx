"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Heart, ShoppingCart, Eye, Edit, Trash2, X, Sun, User, Upload } from "lucide-react"
import ConnectButton from "@/components/ConnectButton"
import { getCollectionsByCreator } from "@/lib/supabase"
import { useAccount } from "wagmi"
import { ModeToggle } from "@/components/toogle"
import router from "next/router"
import { useRouter } from "next/navigation"

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

export default function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    if (!address) {
      setCollections([])
      return
    }
    setLoading(true)
    getCollectionsByCreator(address)
      .then((data) => {
        console.log(data)
        setCollections(
          (data || []).map((c: any) => ({
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
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [address])

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <img src="/logo_branca.png" alt="nfthing" className="h-10 w-30 object-contain" />              
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
              <Button variant="ghost" onClick={() => router.push('/')} className="text-white">Back</Button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold mb-2">Creator Dashboard</h2>
              <p className="text-gray-400 text-lg">create and manage your digital masterpieces</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              onClick={() => window.location.href = '/generator'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-800 text-white"
            />
          </div>
        </div>

        {/* Collections Grid */}
        {!address ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-white mb-2">Connect your wallet to view your collections</h3>
            <p className="text-gray-400 mb-6">You need to connect your wallet to see the collections you have created.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-16 text-gray-400">Loading collections...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCollections.map((collection) => (
              <div key={collection.id} className="group cursor-pointer" onClick={() => setSelectedCollection(collection)}>
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {collection.status === "open" && (
                    <Badge className="absolute top-3 right-3 bg-yellow-600/80 text-yellow-100 border-0">Mint Open</Badge>
                  )}
                  {collection.status === "closed" && (
                    <Badge className="absolute top-3 right-3 bg-red-600/80 text-red-100 border-0">Mint Closed</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-lg group-hover:text-gray-300 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-blue-400 text-sm">by {collection.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-bold text-lg">{collection.price} MON</span>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                      <span className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {collection.totalSales} sold
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {collection.likes}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCollections.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-600 mb-4">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No collections found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm ? "Try adjusting your search" : "Start by creating your first collection"}
            </p>            
          </div>
        )}
      </main>

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl p-0 w-full">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="flex-1 p-6 flex items-center justify-center">
                <img
                  src={selectedCollection.image || "/placeholder.svg"}
                  alt={selectedCollection.name}
                  className="w-full max-w-xs aspect-square object-cover rounded-lg"
                />
              </div>

              {/* Details Section */}
              <div className="flex-1 p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedCollection.name}</h2>
                    <p className="text-blue-400 break-all">by {selectedCollection.creator}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-green-400 text-2xl font-bold">{selectedCollection.price} MON</p>
                    <p className="text-gray-400 text-sm">Mint Price</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-white text-2xl font-bold">{selectedCollection.totalSales}</p>
                    <p className="text-gray-400 text-sm">Total Sales</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-300">{selectedCollection.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Supply: {selectedCollection.itemCount}</span>
                    <span>{selectedCollection.likes} likes</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                    onClick={() => window.location.href = `/collection/${selectedCollection.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Collection
                  </Button>                  
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
