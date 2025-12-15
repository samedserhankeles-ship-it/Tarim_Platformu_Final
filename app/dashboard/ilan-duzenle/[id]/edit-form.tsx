"use client"

import { useState, useTransition } from "react"
import { updateListingAction } from "@/app/actions/listing"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
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
  const [images, setImages] = useState<string[]>(listing.images ? listing.images.split(",") : [])
  const [selectedCity, setSelectedCity] = useState(listing.city || "")

  const currentDistricts = turkeyLocations.find(c => c.city === selectedCity)?.districts || []

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.append("id", listing.id)
    formData.append("type", listing.type)
    
    // Mevcut resimleri de formData'ya ekleyelim (zaten hidden input olarak ekli ama garanti olsun)
    // Ancak hidden inputlar zaten form submit ile otomatik gider.
    // Biz state'teki güncel images listesini (silinenler hariç) gönderelim.
    // FormData'daki existingImages'ları temizleyip state'tekileri ekleyelim mi?
    // En iyisi hidden inputları render etmek.

    startTransition(async () => {
      try {
        await updateListingAction(formData);
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
        </CardHeader>
        <CardContent className="space-y-6">
          
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* İletişim Bilgileri (Opsiyonel) */}
          <div className="space-y-2">
            <Label htmlFor="contactPhone">İletişim Telefonu (Opsiyonel)</Label>
            <Input 
              id="contactPhone" 
              name="contactPhone" 
              placeholder="İlanınız için alternatif bir telefon numarası (örn: 05xx xxx xx xx)" 
              type="tel"
              defaultValue={listing.contactPhone || ""}
            />
          </div>

          {/* Galeri Önizleme ve Yönetimi */}
          <div className="space-y-2">
            <Label>Mevcut Fotoğraflar</Label>
            <div className="flex gap-4 overflow-x-auto pb-2 flex-wrap">
                {images.map((img, i) => (
                    <div key={i} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="ilan" className="h-24 w-24 object-cover rounded-lg border" />
                        <button
                            type="button"
                            onClick={() => handleRemoveImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                        {/* Mevcut resim URL'sini hidden input olarak gönder */}
                        <input type="hidden" name="existingImages" value={img} />
                    </div>
                ))}
                {images.length === 0 && <p className="text-sm text-muted-foreground w-full">Fotoğraf yok.</p>}
            </div>
          </div>

          {/* Yeni Fotoğraf Yükleme */}
          <div className="space-y-2">
            <Label htmlFor="images">Yeni Fotoğraf Ekle</Label>
            <div className="flex items-center gap-4">
                <Input id="images" name="images" type="file" multiple accept="image/*" className="cursor-pointer" />
            </div>
            <p className="text-xs text-muted-foreground">Yeni yükledikleriniz mevcutların yanına eklenir.</p>
          </div>

        </CardContent>
        <CardFooter className="flex justify-end border-t px-6 py-4">
          <Button size="lg" type="submit" disabled={isPending}>
            {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}