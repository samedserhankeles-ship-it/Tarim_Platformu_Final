"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  title: string
  isBarter?: boolean
  type?: "job" | "product"
}

export default function ImageGallery({ images, title, isBarter, type }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  // Klavye kontrolü (Sağ/Sol ok tuşları)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, images.length])

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-muted border shadow-sm aspect-video flex items-center justify-center text-muted-foreground">
        Görsel Yok
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Büyük Ana Resim ve Lightbox */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative group">
            <div 
                className="rounded-2xl overflow-hidden bg-background border shadow-sm aspect-video relative cursor-zoom-in"
                onClick={() => setIsOpen(true)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                src={images[selectedIndex]} 
                alt={`${title} - Görsel ${selectedIndex + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Etiketler */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    {isBarter ? (
                    <span className="bg-purple-600 text-white border-purple-600 px-3 py-1 text-sm rounded-full font-medium shadow-sm">
                        Takas Teklifi
                    </span>
                    ) : (
                    <span className="bg-background/90 text-foreground backdrop-blur px-3 py-1 text-sm rounded-full font-medium shadow-sm">
                        {type === "job" ? "İş İlanı" : "Satılık"}
                    </span>
                    )}
                </div>

                {/* Büyüt İkonu */}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Maximize2 className="h-5 w-5" />
                </div>
            </div>

            <DialogContent className="max-w-6xl w-full p-0 bg-transparent border-none shadow-none flex items-center justify-center outline-none overflow-hidden">
                <DialogTitle className="sr-only">
                  {title} - Görsel {selectedIndex + 1}
                </DialogTitle>
                
                <div className="relative w-full h-[90vh] flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    
                    {/* Önceki Butonu */}
                    {images.length > 1 && (
                        <button 
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-50 backdrop-blur-sm"
                            onClick={handlePrev}
                            aria-label="Önceki görsel"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={images[selectedIndex]} 
                        alt={`${title} - Tam Ekran`} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-default animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Resme tıklayınca kapanmasın
                    />

                    {/* Sonraki Butonu */}
                    {images.length > 1 && (
                        <button 
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all z-50 backdrop-blur-sm"
                            onClick={handleNext}
                            aria-label="Sonraki görsel"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    )}
                </div>
            </DialogContent>
        </div>
      </Dialog>

      {/* Küçük Resimler (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-gray-300"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img} 
                alt={`Küçük resim ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
