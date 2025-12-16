"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Loader2, User } from "lucide-react"
import { sendMessageAction } from "@/app/actions/message"
import { toast } from "sonner"

interface MessageButtonProps {
  receiverId: string;
  listingTitle?: string;
  currentUserId?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function MessageButton({ 
  receiverId, 
  listingTitle, 
  currentUserId, 
  className = "w-full",
  variant = "default",
  size = "lg"
}: MessageButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(listingTitle ? `Merhaba, "${listingTitle}" ilanınızla ilgileniyorum.` : "Merhaba,")
  const [isPending, startTransition] = useTransition()

  if (currentUserId === receiverId) {
    return null; // Kendi profili/ilanı ise butonu gösterme
  }

  const handleSend = () => {
    startTransition(async () => {
      const result = await sendMessageAction(receiverId, message)
      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} size={size} variant={variant}>
            <MessageSquare className="mr-2 h-5 w-5" />
            {listingTitle ? "Mesaj Gönder" : "Mesaj At"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mesaj Gönder</DialogTitle>
          <DialogDescription>
            {listingTitle ? "İlan sahibine mesajınızı iletin." : "Kullanıcıya mesajınızı iletin."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSend} disabled={isPending}>
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                </>
            ) : (
                "Gönder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
