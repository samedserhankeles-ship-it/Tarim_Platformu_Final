"use client"

import { useState, useTransition, useRef } from "react"
import { updateListingAction } from "@/app/actions/listing"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, ImagePlus, X } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { turkeyLocations } from "@/lib/locations"

export default function EditListingForm({ listing }: { listing: any }) {
  const [isPending, startTransition] = useTransition()
  // Mevcut resimler (URL stringleri)
  const [existingImages, setExistingImages] = useState<string[]>(listing.images ? listing.images.split(",").filter((url: string) => url.trim() !== "") : [])
  // Yeni seçilen resim dosyaları
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [selectedCity, setSelectedCity] = useState(listing.city || "")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentDistricts = turkeyLocations.find(c => c.city === selectedCity)?.districts || []

  // Mevcut resmi sil
  const handleRemoveExistingImage = (indexToRemove: number) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  // Yeni seçilen resmi listeden çıkar
  const handleRemoveNewFile = (indexToRemove: number) => {
    setNewFiles(newFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setNewFiles(prev => [...prev, ...files])
    }
  }

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", listing.id)
    formData.append("type", listing.type)
    
    // Varsayılan input file'dan gelenleri temizle
    formData.delete("images")
    
    // Yeni seçilen dosyaları ekle
    newFiles.forEach(file => {
        formData.append("images", file)
    })

    startTransition(async () => {
      try {
        await updateListingAction(formData);
        toast.success("İlan başarıyla güncellendi.");
      } catch (error: any) {
        toast.error(error.message || "İlan güncellenirken bir hata oluştu.");
      }
    })
  }

  return (
    <form action={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>İlan Detayları</CardTitle>
          <CardDescription>İlan bilgilerinizi güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Başlık ve Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="title">İlan Başlığı</Label>
            <Input id="title" name="title" defaultValue={listing.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea 
              id="description"
              name="description"
              className="min-h-[120px]"
              defaultValue={listing.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Fiyat / Ücret</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₺</span>
              <Input id="price" name="price" className="pl-7" defaultValue={listing.price} />
            </div>
          </div>

          {/* Konum */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>İl</Label>
              <Select name="city" defaultValue={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="İl Seçiniz" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {turkeyLocations.map((loc) => (
                    <SelectItem key={loc.city} value={loc.city}>
                      {loc.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>İlçe</Label>
              <Select name="district" defaultValue={listing.district} disabled={!selectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="İlçe Seçiniz" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {currentDistricts.map((dist) => (
                    <SelectItem key={dist} value={dist}>
                      {dist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="village">Köy / Mahalle</Label>
                <Input 
                  id="village" 
                  name="village" 
                  placeholder="Köy veya mahalle adı" 
                  defaultValue={listing.village || ""}
                  disabled={!selectedCity} 
                />
            </div>
          </div>

          {/* İletişim Bilgileri (Opsiyonel) */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">İletişim Telefonu (Opsiyonel)</Label>
            <Input 
              id="contactPhone" 
              name="contactPhone" 
              placeholder="İlanınız için alternatif bir telefon numarası" 
              type="tel"
              defaultValue={listing.contactPhone || ""}
            />
          </div>

          {/* Fotoğraf Yönetimi */}
          <div className="space-y-4">
            <Label>Fotoğraflar</Label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Mevcut Resimler */}
                {existingImages.map((img, i) => (
                    <div key={`existing-${i}`} className="relative aspect-square group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="ilan" className="w-full h-full object-cover rounded-lg border" />
                        <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-blue-500/80 text-white text-[10px] px-2 py-0.5 rounded">
                            Mevcut
                        </div>
                        {/* Form submit olduğunda bu değerler gidecek */}
                        <input type="hidden" name="existingImages" value={img} />
                    </div>
                ))}

                {/* Yeni Seçilenler */}
                {newFiles.map((file, i) => (
                    <div key={`new-${i}`} className="relative aspect-square group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="yeni" 
                          className="w-full h-full object-cover rounded-lg border border-dashed border-primary" 
                        />
                        <button
                            type="button"
                            onClick={() => handleRemoveNewFile(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-green-500/80 text-white text-[10px] px-2 py-0.5 rounded">
                            Yeni
                        </div>
                    </div>
                ))}
                
                {/* Ekleme Butonu */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Resim Ekle</span>
                </div>
            </div>

            <input 
                ref={fileInputRef}
                id="images" 
                name="images" 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileSelect}
            />
            
            <p className="text-xs text-muted-foreground">
              Fotoğraf eklemek için tıklayın. Kapak fotoğrafı listedeki ilk fotoğraftır.
            </p>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button size="lg" type="submit" disabled={isPending}>
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
    </form>
  )
}
