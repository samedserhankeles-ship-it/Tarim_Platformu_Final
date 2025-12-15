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

export default function MessageButton({ receiverId, listingTitle, currentUserId }: { receiverId: string, listingTitle: string, currentUserId?: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(`Merhaba, "${listingTitle}" ilanınızla ilgileniyorum.`)
  const [isPending, startTransition] = useTransition()

  if (currentUserId === receiverId) {
    return (
        <Button className="w-full h-12 text-base font-semibold" size="lg" disabled variant="secondary">
            <User className="mr-2 h-5 w-5" />
            Kendi İlanınız
        </Button>
    )
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
        <Button className="w-full h-12 text-base font-semibold" size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Mesaj Gönder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mesaj Gönder</DialogTitle>
          <DialogDescription>
            İlan sahibine mesajınızı iletin.
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
