"use client"

import { useState, useMemo, useEffect } from "react"
import { CollectionCard } from "@/components/explorer/CollectionCard"
import { CollectionFilters } from "@/components/explorer/CollectionFilters"
import { getCollections } from "@/lib/supabase"

// Import Collection type from CollectionCard
import type { Collection } from "@/components/explorer/CollectionCard"
import { Button } from "@/components/ui/button"
import ConnectButton from "@/components/ConnectButton"
import { ModeToggle } from "@/components/toogle"
import { useRouter } from "next/navigation"
import { useThemeLogo } from "@/hooks/useTheme"

export default function NFTExplorer() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const router = useRouter()
  const { logo } = useThemeLogo()

  useEffect(() => {
    async function fetchCollections() {
      setLoading(true)
      try {
        const data = await getCollections()
        // Map DB fields to Collection interface
        const mapped = (data || []).map((c: any) => ({
          id: String(c.id),
          name: c.name || "",
          description: c.description || "",
          itemCount: c.supply || 0,
          price: c.price || "0",
          floorPrice: c.floorPrice || "0",
          totalSales: c.sales || 0,
          likes: c.likes || 0,
          image: c.image || "/placeholder.svg",
          creator: c.creator || "",
          contract: c.contract || "",
          status: c.mintIsActive ? "open" : "closed" as "open" | "closed",
        }))
        setCollections(mapped)
      } catch (e) {
        setCollections([])
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const filteredAndSortedCollections = useMemo(() => {
    const filtered = collections.filter((collection) => {
      const matchesSearch =
        collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.creator.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || collection.status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort collections
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "likes":
          return b.likes - a.likes
        case "totalSales":
          return b.totalSales - a.totalSales
        case "itemCount":
          return b.itemCount - a.itemCount
        default:
          return 0
      }
    })

    return filtered
  }, [collections, searchQuery, statusFilter, sortBy])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <img src={logo} alt="nfthing" className="h-10 w-30 object-contain" />              
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/')} className="text-white">Back</Button>
              <ConnectButton />
              <ModeToggle />
            </div>
            
          </div>
        </div>
      </header>
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Explore NFT Collections</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and mint unique digital collectibles from talented creators around the world
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Filters */}
          <CollectionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {loading
                ? "Loading collections..."
                : `Showing ${filteredAndSortedCollections.length} of ${collections.length} collections`}
            </p>
          </div>

          {/* Collections Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading collections...</p>
            </div>
          ) : filteredAndSortedCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedCollections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No collections found matching your criteria.</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
