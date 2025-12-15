"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Phone, Eye, EyeOff, Lock } from "lucide-react"
import Link from "next/link"

export default function CallButton({ phoneNumber, isLoggedIn }: { phoneNumber: string | null, isLoggedIn: boolean }) {
  const [showNumber, setShowNumber] = useState(false)

  if (!phoneNumber) {
    return (
        <Button variant="outline" className="w-full" disabled>
            <Phone className="mr-2 h-4 w-4" />
            Numara Eklenmemiş
        </Button>
    )
  }

  if (!isLoggedIn) {
    return (
        <Button asChild variant="outline" className="w-full text-muted-foreground">
            <Link href="/auth/sign-in">
                <Lock className="mr-2 h-4 w-4" />
                Numarayı Görmek İçin Giriş Yapın
            </Link>
        </Button>
    )
  }

  const cleanPhone = phoneNumber ? phoneNumber.replace(/[^0-9+]/g, '') : ""

  return (
    <div className="flex gap-2">
        {showNumber ? (
            <Button asChild variant="outline" className="w-full bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800">
                <a href={`tel:${cleanPhone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    {phoneNumber}
                </a>
            </Button>
        ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowNumber(true)}>
                <Phone className="mr-2 h-4 w-4" />
                İlan Sahibini Ara
            </Button>
        )}
    </div>
  )
}
