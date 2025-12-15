"use client"

import { useState, useTransition, useRef } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AVAILABLE_ROLES } from "@/lib/roles"

export default function ProfileForm({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition()
  const [preview, setPreview] = useState<string | null>(user.image)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [role, setRole] = useState<string>(user.role || "FARMER")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("File selected:", file.name, file.size, file.type)
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    
    // File'ı state'ten veya input'tan al ve FormData'ya ekle
    if (selectedFile) {
      formData.set("image", selectedFile)
      console.log("Image added to formData from state:", selectedFile.name, selectedFile.size)
    } else {
      const fileInput = fileInputRef.current
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.set("image", fileInput.files[0])
        console.log("Image added to formData from input:", fileInput.files[0].name)
      } else {
        console.log("No file selected")
      }
    }

    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(formData)
        if (result.success) {
          toast.success(result.message)
          // Başarılı olursa sayfayı yenile (yeni resmi görmek için)
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

        {/* Sidebar / Avatar Area */}
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 pb-8 pt-8 text-center">
              <div className="mx-auto relative mb-4 h-32 w-32 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-full w-full">
                   <AvatarImage src={preview || undefined} className="object-cover" />
                   <AvatarFallback className="text-4xl">
                     {first ? first[0].toUpperCase() : "U"}
                     {last ? last[0].toUpperCase() : ""}
                   </AvatarFallback>
                </Avatar>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white h-8 w-8" />
                </div>
                
                <input 
                    type="file" 
                    name="image" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                />
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.role}</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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
              <Button variant="outline" className="w-full mt-4" type="button" onClick={() => fileInputRef.current?.click()}>
                Fotoğraf Değiştir
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
