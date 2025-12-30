"use client"

import { useState, useTransition } from "react"
import { createForumReplyAction } from "@/app/actions/forum"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Loader2 } from "lucide-react"

export function ReplyForm({ topicId, userImage }: { topicId: string, userImage: string | null }) {
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      const result = await createForumReplyAction(topicId, content)
      if (result.success) {
        toast.success(result.message)
        setContent("")
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <Avatar className="hidden sm:flex border">
          <AvatarImage src={userImage || undefined} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea 
            placeholder="Yanıtınızı buraya yazın..." 
            className="min-h-[120px] bg-white"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button disabled={isPending || !content.trim()} className="bg-emerald-600 hover:bg-emerald-700">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Yanıt Gönder
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
