import Image from "next/image"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface Collection {
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
    contract: string
    status: "open" | "closed"
  }

export function CollectionCard({collection}: {collection: Collection}) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={collection.image || "/placeholder.svg"}
          alt={collection.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          style={{ position: "absolute", inset: 0 }}
        />        
      </div>

      <CardContent className="p-6 space-y-4">
      <Badge            
            className={`${collection.status === "open" ? "bg-green-600/80 text-green-100 border-0" : "bg-red-600/80 text-red-100 border-0"}`}
          >
            {collection.status}
          </Badge>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">{collection.name}</h3>
          <p className="text-muted-foreground text-sm">by {collection.creator}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{collection.price} ETH</p>
            <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{collection.likes}</span>
          </div>
        </div>

        <Button
          className="w-full h-12"
          disabled={collection.status === "closed"}
          variant={collection.status === "open" ? "default" : "secondary"}
        >
          {collection.status === "open" ? "Mint Now" : "Mint Closed"}
        </Button>
      </CardContent>
    </Card>
  )
}
