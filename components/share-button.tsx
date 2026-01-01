"use client"

import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
    title: string
    text?: string
    url?: string // Eğer verilmezse window.location.href kullanılır
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

export default function ShareButton({ title, text, url, className, variant = "ghost", size = "icon" }: ShareButtonProps) {

    const handleShare = async () => {
        const shareUrl = url || window.location.href
        
        const shareData = {
            title: title,
            text: text || title,
            url: shareUrl
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.log("Paylaşım iptal edildi.")
            }
        } else {
            try {
                await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`)
                toast.success("Bağlantı panoya kopyalandı")
            } catch (err) {
                toast.error("Kopyalama başarısız")
            }
        }
    }

    return (
        <Button 
            variant={variant} 
            size={size} 
            onClick={handleShare} 
            className={cn("text-muted-foreground hover:text-foreground", className)}
            title="Paylaş"
        >
            <Share2 className="h-5 w-5" />
            {size !== "icon" && <span className="ml-2">Paylaş</span>}
        </Button>
    )
}
