"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-[180px] bg-white">
        <SelectValue placeholder="Sıralama" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">En Yeni</SelectItem>
        <SelectItem value="oldest">En Eski</SelectItem>
        <SelectItem value="price_asc">Fiyat: Artan</SelectItem>
        <SelectItem value="price_desc">Fiyat: Azalan</SelectItem>
      </SelectContent>
    </Select>
  )
}
