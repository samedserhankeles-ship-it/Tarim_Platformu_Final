"use client"

import { useState, useTransition } from "react"
import { createTopicAction } from "@/app/actions/forum"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const CATEGORIES = ["GENEL", "TARIM", "HAYVANCILIK", "TEKNOLOJİ", "PAZARLAMA"]

export function NewTopicForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [category, setCategory] = useState("GENEL")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("category", category)

    startTransition(async () => {
      const result = await createTopicAction(formData)
      if (result.success) {
        toast.success(result.message)
        router.push(`/community/topic/${result.topicId}`)
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Konu Başlığı</Label>
        <Input 
          id="title" 
          name="title" 
          placeholder="Örn: Buğday ekiminde dikkat edilmesi gerekenler" 
          required 
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Kategori</Label>
        <Select value={category} onValueChange={setCategory} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">İçerik</Label>
        <Textarea 
          id="content" 
          name="content" 
          placeholder="Tartışmak istediğiniz detayları yazın..." 
          className="min-h-[200px]" 
          required 
          disabled={isPending}
        />
      </div>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Konuyu Oluştur
      </Button>
    </form>
  )
}
