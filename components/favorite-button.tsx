"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toggleFavoriteAction } from "@/app/actions/favorite"
import { toast } from "sonner"

export default function FavoriteButton({ listingId, type, initialIsFavorited }: { listingId: string, type: "product" | "job", initialIsFavorited: boolean }) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // Optimistic UI update
    const previousState = isFavorited;
    setIsFavorited(!isFavorited);

    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId, type)
      if (result.success) {
        setIsFavorited(!!result.isFavorited)
        toast.success(result.message)
      } else {
        // Revert on error
        setIsFavorited(previousState)
        toast.error(result.message)
      }
    })
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={`shrink-0 transition-colors ${isFavorited ? 'text-red-500 hover:text-red-600 bg-red-50' : 'text-muted-foreground hover:text-red-500'}`}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
    </Button>
  )
}
