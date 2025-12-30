"use client"

import { useState, useTransition, useRef } from "react"
import { createPostAction } from "@/app/actions/social"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Image as ImageIcon, Video, Loader2, X } from "lucide-react"
import { toast } from "sonner" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CreatePostProps {
  userImage?: string | null
  userName?: string | null
}

export function CreatePost({ userImage, userName }: CreatePostProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearMedia = () => {
    setMediaFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async () => { 
    if (!content.trim() && !mediaFile) return

    const formData = new FormData()
    formData.append("content", content)
    if (mediaFile) {
      formData.append("media", mediaFile)
    }

    startTransition(async () => {
      try {
        const result = await createPostAction(formData)
        if (result.success) {
          toast.success(result.message)
          setContent("")
          clearMedia()
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Submit error:", error)
        toast.error("Paylaşım yapılırken bir hata oluştu.")
      }
    })
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={userImage || undefined} />
            <AvatarFallback>{userName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea 
              placeholder="Neler oluyor? Fotoğraf veya video paylaş..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base min-h-[80px]"
            />
            
            {previewUrl && (
              <div className="relative rounded-md overflow-hidden bg-muted max-h-[300px] w-fit">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full z-10"
                    onClick={clearMedia}
                >
                    <X className="h-4 w-4" />
                </Button>
                {mediaFile?.type.startsWith("video/") ? (
                  <video src={previewUrl} controls className="max-h-[300px] object-contain" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="max-h-[300px] object-contain" />
                )}
              </div>
            )}

            <div className="flex justify-between items-center border-t pt-4">
              <div className="flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                />
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={() => {
                    if(fileInputRef.current) {
                        fileInputRef.current.accept = "image/*";
                        fileInputRef.current.click();
                    }
                }}>
                  <ImageIcon className="h-4 w-4" /> Fotoğraf
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2" onClick={() => {
                    if(fileInputRef.current) {
                        fileInputRef.current.accept = "video/*";
                        fileInputRef.current.click();
                    }
                }}>
                  <Video className="h-4 w-4" /> Video
                </Button>
              </div>
              <Button onClick={handleSubmit} disabled={isPending || (!content.trim() && !mediaFile)}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Paylaş"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
