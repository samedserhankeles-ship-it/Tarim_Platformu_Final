"use client"

import { useState, useTransition } from "react"
import { updateUserProfileAction } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { AVAILABLE_ROLES } from "@/lib/roles"
import { ImageUploadField } from "@/components/ImageUploadField" // Yeni ImageUploadField bileşeni

export default function ProfileForm({ user }: { user: any }) { // user tipi daha spesifik hale getirilebilir
  const [isPending, startTransition] = useTransition()
  
  const [role, setRole] = useState<string>(user.role || "FARMER")
  

  // İsim ayrıştırma (Basitçe)
  const splitName = (fullName: string | null) => {
    if (!fullName) return { first: "", last: "" }
    const parts = fullName.split(" ")
    if (parts.length === 1) return { first: parts[0], last: "" }
    const last = parts.pop()
    const first = parts.join(" ")
    return { first, last }
  }

  const { first, last } = splitName(user.name)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    // ImageUploadField bileşeni, input'un name prop'u sayesinde dosyaları
    // doğrudan formData'ya ekleyecektir. Burada ekstra formData.set() yapmaya gerek yok.
    // Ancak, eğer ImageUploadField içinde dosya seçilmezse, formData'ya eklenmez.
    // Bu durumda updateUserProfileAction içinde mevcut resmin korunması mantığı işlemelidir.
    // (ki bu zaten handle ediliyor.)

    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(formData)
        if (result.success) {
          toast.success(result.message)
          // Başarılı olursa sayfayı yenile (yeni resimleri görmek için)
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        console.error("Submit error:", error)
        toast.error("Bir hata oluştu. Lütfen tekrar deneyin.")
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_250px] lg:grid-cols-[1fr_300px]">
      <form onSubmit={handleSubmit} className="contents" encType="multipart/form-data">
        {/* Main Form Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>
                Diğer kullanıcıların sizi tanıması için temel bilgilerinizi girin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input id="firstName" name="firstName" defaultValue={first} placeholder="Adınız" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input id="lastName" name="lastName" defaultValue={last} placeholder="Soyadınız" required />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresi</Label>
                  <Input id="email" name="email" type="email" defaultValue={user.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="role" className="w-full">
                      <SelectValue placeholder="Rol Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="role" value={role} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={user.phone || ""} placeholder="05XX XXX XX XX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Hakkımda</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Kendinizden bahsedin..."
                  className="min-h-[100px]"
                  defaultValue={user.bio || ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mesleki Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crops">Yetiştirdiği Ürünler / Uzmanlık</Label>
                <Input id="crops" name="crops" defaultValue={user.crops || ""} placeholder="Örn: Buğday, Arpa, Mısır" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificates">Sertifikalar</Label>
                <Input id="certificates" name="certificates" defaultValue={user.certificates || ""} placeholder="Örn: İyi Tarım Uygulamaları" />
              </div>
            </CardContent>
          </Card>

          {role === "BUSINESS" && (
            <Card>
                <CardHeader>
                    <CardTitle>İşletme Bilgileri</CardTitle>
                    <CardDescription>İşletmenize ait detayları girin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="website">Web Sitesi</Label>
                        <Input id="website" name="website" type="url" defaultValue={user.website || ""} placeholder="https://ornek.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressDetail">Açık Adres</Label>
                        <Textarea id="addressDetail" name="addressDetail" defaultValue={user.addressDetail || ""} placeholder="Mahalle, Sokak, No..." className="min-h-[80px]" />
                    </div>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Adres Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">İl</Label>
                  <Input id="city" name="city" defaultValue={user.city || ""} placeholder="Örn: Konya" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input id="district" name="district" defaultValue={user.district || ""} placeholder="Örn: Karatay" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button size="lg" className="w-full md:w-auto" type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar / Avatar & Cover Image Area */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            {/* Cover Image Area */}
            <div className="relative h-40 bg-muted">
                <ImageUploadField 
                  id="coverImageUpload"
                  name="coverImage"
                  label="Banner Resmi"
                  defaultValue={user.coverImage}
                  variant="banner"
                  currentValue={user.coverImage}
                />
            </div>

            <CardHeader className="text-center relative pt-0 -mt-16 pb-6">
              {/* Avatar */}
              <div className="relative z-10 mx-auto h-32 w-32 rounded-full border-4 border-background bg-background flex items-center justify-center shadow-sm">
                <div className="h-full w-full rounded-full overflow-hidden">
                    <ImageUploadField 
                    id="avatarUpload"
                    name="image"
                    label="Profil Fotoğrafı"
                    defaultValue={user.image}
                    variant="avatar"
                    fallbackText={`${first ? first[0].toUpperCase() : "U"}${last ? last[0].toUpperCase() : ""}`}
                    currentValue={user.image}
                    />
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.role}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Üyelik Tarihi:</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hesap Durumu:</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    Aktif
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}