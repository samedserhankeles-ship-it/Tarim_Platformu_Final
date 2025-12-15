"use client"

import { useState, useEffect, useRef } from "react"
import { getMessages, sendMessageAction } from "@/app/actions/message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import BlockButton from "@/components/block-button"
import ReportButton from "@/components/report-button"; // Import ReportButton

export default function ChatView({ conversationId, partner, initialMessages, initialIsBlocked, isLoggedIn }: { conversationId: string, partner: any, initialMessages: any[], initialIsBlocked: boolean, isLoggedIn: boolean }) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Polling (Her 5 saniyede bir yeni mesajları kontrol et)
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
    if (!newMessage.trim()) return
    setIsSending(true)
    
    // Optimistic UI: Mesajı hemen ekle
    const optimisticMsg = {
        id: "temp-" + Date.now(),
        content: newMessage,
        senderId: "me", // Backend'de senderId kontrol edilecek ama UI için "me" varsayalım (veya gerçek ID'yi prop geçelim)
        createdAt: new Date(),
        isRead: false
    }
    // Not: "me" kontrolü için kullanıcının kendi ID'sine ihtiyacımız var.
    // Şimdilik backend'den dönen cevabı bekleyelim, optimistic biraz riskli olabilir ID yoksa.
    
    const result = await sendMessageAction(partner.id, newMessage)
    
    if (result.success) {
        setNewMessage("")
        const updatedMessages = await getMessages(conversationId)
        setMessages(updatedMessages)
        router.refresh() // Sohbet listesini güncelle
    }
    
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={partner.image || undefined} />
                    <AvatarFallback>{partner.name ? partner.name.substring(0,2).toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{partner.name}</h3>
            </div>
            <div className="flex gap-2"> {/* Use flex gap for buttons */}
                <BlockButton userId={partner.id} initialIsBlocked={initialIsBlocked} />
                <ReportButton reportedUserId={partner.id} isLoggedIn={isLoggedIn} variant="outline" className="text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600 border-yellow-200" />
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-muted/30">
            {messages.map((msg) => {
                const isMe = msg.senderId !== partner.id // Partner değilse bendimdir
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
                            <p>{msg.content}</p>
                            <span className={`text-xs mt-1 block text-right opacity-70`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background flex items-center gap-2">
            <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Mesajınızı yazın..." 
                className="flex-1 h-12" 
            />
            <Button size="icon" className="h-12 w-12" onClick={handleSendMessage} disabled={isSending}>
                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </div>
    </div>
  )
}