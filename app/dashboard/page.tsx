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

interface Collection {
  id: string
  name: string
  description: string
  itemCount: number
  floorPrice: string
  totalSales: number
  likes: number
  image: string
  creator: string
  status: "published" | "draft" | "pending"
}

export default function CollectionsManager() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (!address) {
      setCollections([])
      return
    }
    setLoading(true)
    getCollectionsByCreator(address)
      .then((data) => {
        setCollections(
          (data || []).map((c: any) => ({
            id: String(c.id),
            name: c.name || "",
            description: c.description || "",
            itemCount: c.supply || 0,
            floorPrice: c.floorPrice || "0",
            totalSales: c.sales || 0,
            likes: c.likes || 0,
            image: c.baseUri || "/placeholder.svg?height=300&width=300",
            creator: c.creator || "",
            status: c.mintIsActive === false ? "draft" : "published",
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
              <img src="/logo-4.png" alt="nfthing" className="w-20 h-5" />              
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
              <ModeToggle />
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
              <h2 className="text-4xl font-bold mb-2">manage collections</h2>
              <p className="text-gray-400 text-lg">create and manage your digital masterpieces</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm text-gray-300">
                      Collection Name
                    </Label>
                    <Input id="name" placeholder="My Amazing Collection" className="bg-gray-800 border-gray-700 mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm text-gray-300">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your collection..."
                      className="bg-gray-800 border-gray-700 mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300">Collection Image</Label>
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center mt-1">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-400 text-sm">Click to upload or drag an image</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-700">
                      Cancel
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">Create Collection</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
            <ConnectButton />
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
                  {collection.status === "draft" && (
                    <Badge className="absolute top-3 right-3 bg-yellow-600/80 text-yellow-100 border-0">Draft</Badge>
                  )}
                  {collection.status === "pending" && (
                    <Badge className="absolute top-3 right-3 bg-blue-600/80 text-blue-100 border-0">Pending</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-white font-semibold text-lg group-hover:text-gray-300 transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-blue-400 text-sm">by {collection.creator}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-bold text-lg">{collection.floorPrice} MON</span>
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
            {!searchTerm && (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Collection
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Collection Detail Modal */}
      {selectedCollection && (
        <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl p-0">
            <div className="flex">
              {/* Image Section */}
              <div className="flex-1 p-6">
                <img
                  src={selectedCollection.image || "/placeholder.svg"}
                  alt={selectedCollection.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              </div>

              {/* Details Section */}
              <div className="flex-1 p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedCollection.name}</h2>
                    <p className="text-blue-400">by {selectedCollection.creator}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCollection(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-green-400 text-2xl font-bold">{selectedCollection.floorPrice} MON</p>
                    <p className="text-gray-400 text-sm">Floor Price</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-white text-2xl font-bold">{selectedCollection.totalSales}</p>
                    <p className="text-gray-400 text-sm">Total Sales</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-300">{selectedCollection.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{selectedCollection.itemCount} items</span>
                    <span>{selectedCollection.likes} likes</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                    <Eye className="w-4 h-4 mr-2" />
                    View Collection
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-gray-700 text-white hover:bg-gray-800 bg-transparent">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/20 bg-transparent"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
