"use client"

import { useState, useEffect, useRef } from "react"
import { getMessages, sendMessageWithMediaAction } from "@/app/actions/message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Paperclip, X, FileVideo, Image as ImageIcon, ZoomIn } from "lucide-react"
import { useRouter } from "next/navigation"
import BlockButton from "@/components/block-button"
import ReportButton from "@/components/report-button"; 
import Link from "next/link"; 
import { toast } from "sonner"; 
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ChatView({ conversationId, partner, initialMessages, initialIsBlocked, isLoggedIn }: { conversationId: string, partner: any, initialMessages: any[], initialIsBlocked: boolean, isLoggedIn: boolean }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter()

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling
  useEffect(() => {
    const interval = setInterval(async () => {
      const latestMessages = await getMessages(conversationId)
      if (latestMessages.length > messages.length) {
        setMessages(latestMessages)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId, messages.length])

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return
    setIsSending(true)
    
    const formData = new FormData();
    formData.append("receiverId", partner.id);
    formData.append("content", newMessage || " "); // Boşsa bir boşluk at ki validation geçerse
    if (selectedFile) {
        formData.append("media", selectedFile);
    }

    try {
        const result = await sendMessageWithMediaAction(formData)
        
        if (result.success) {
            setNewMessage("")
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            
            const updatedMessages = await getMessages(conversationId)
            setMessages(updatedMessages)
            router.refresh() 
        } else {
            toast.error(result.message || "Mesaj gönderilemedi.");
        }
    } catch (err) {
        toast.error("Bir hata oluştu.");
        console.error(err);
    }
    
    setIsSending(false)
  }


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
              alert("Dosya boyutu 10MB'dan küçük olmalıdır.");
              return;
          }
          setSelectedFile(file);
          const url = URL.createObjectURL(file);
          setPreview(url);
      }
  }

  const clearFile = () => {
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background shrink-0">
            <Link href={`/profil/${partner.id}`} className="flex items-center gap-3 hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={partner.image || undefined} />
                    <AvatarFallback>{partner.name ? partner.name.substring(0,2).toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg hover:underline text-foreground">{partner.name}</h3>
            </Link>
            <div className="flex gap-2"> 
                <BlockButton userId={partner.id} initialIsBlocked={initialIsBlocked} />
                <ReportButton reportedUserId={partner.id} isLoggedIn={isLoggedIn} variant="outline" className="text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600 border-yellow-200" />
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30 min-h-0">
            {messages.map((msg) => {
                const isMe = msg.senderId !== partner.id 
                return (
                    <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 text-sm ${
                                isMe
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-foreground border shadow-sm"
                            }`}
                        >
                            {msg.media && (
                                <div className="mb-2 rounded-md overflow-hidden bg-black/10 relative group">
                                    {msg.mediaType === 'VIDEO' || (msg.media.endsWith('.mp4') || msg.media.endsWith('.webm')) ? (
                                        <video src={msg.media} controls className="max-w-full max-h-64 object-contain" />
                                    ) : (
                                        <div 
                                            className="relative cursor-pointer"
                                            onClick={() => setZoomedImage(msg.media)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={msg.media} alt="Medya" className="max-w-full max-h-64 object-cover transition-transform hover:scale-[1.02]" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ZoomIn className="h-8 w-8 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {msg.content && <p>{msg.content}</p>}
                            <span className={`text-xs mt-1 block text-right opacity-70`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Image Zoom Modal */}
        <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
                <DialogTitle className="sr-only">Görsel Önizleme</DialogTitle>
                <DialogDescription className="sr-only">Büyütülmüş görsel görünümü</DialogDescription>
                {zoomedImage && (
                    <div className="relative w-full h-full flex items-center justify-center" onClick={() => setZoomedImage(null)}>
                        <button 
                            onClick={() => setZoomedImage(null)}
                            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={zoomedImage} 
                            alt="Büyük Görsel" 
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>

        {/* Input Area */}
        <div className="p-4 border-t bg-background space-y-3">
            {preview && (
                <div className="relative inline-block border rounded-lg overflow-hidden bg-muted">
                    {selectedFile?.type.startsWith('video/') ? (
                         <div className="h-20 w-20 flex items-center justify-center bg-black/10">
                             <FileVideo className="h-8 w-8 text-muted-foreground" />
                         </div>
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Önizleme" className="h-20 w-auto object-cover" />
                    )}
                    <button 
                        onClick={clearFile}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            )}
            
            <div className="flex items-center gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

                <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Mesajınızı yazın..." 
                    className="flex-1 h-12" 
                />
                <Button size="icon" className="h-12 w-12" onClick={handleSendMessage} disabled={isSending || (!newMessage.trim() && !selectedFile)}>
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
        </div>
    </div>
  )
}