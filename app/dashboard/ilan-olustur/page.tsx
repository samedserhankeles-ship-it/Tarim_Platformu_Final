"use client"

import { useState, useTransition } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImagePlus, Upload, X, RefreshCw, Loader2 } from "lucide-react"
import { createListingAction } from "@/app/actions/listing"
import { turkeyLocations } from "@/lib/locations"

export default function CreateListingPage() {
  const [listingType, setListingType] = useState("product")
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState("")

  const currentDistricts = turkeyLocations.find(c => c.city === selectedCity)?.districts || []

  // Select değerlerini formda taşımak için state veya name kullanımı biraz tricky.
  // En kolayı HTML input type="hidden" kullanmak ve select değiştikçe onu güncellemektir.
  // Ancak Shadcn Select bileşeni "name" prop'unu destekler, bu sayede FormData'ya otomatik dahil olur.

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null)
    // listingType'ı manuel ekle (state olduğu için)
    formData.append("type", listingType)

    startTransition(async () => {
      try {
        await createListingAction(formData);
        // Eğer buraya gelirse, redirect çalışmadı veya başka bir sorun var
        // Normalde createListingAction başarılı olursa redirect yapar ve bu satırlara gelmez.
      } catch (error: any) {
        setErrorMessage(error.message || "İlan oluşturulurken bir hata oluştu.");
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Yeni İlan Oluştur</h1>
        <p className="text-muted-foreground">
          Satmak, kiralamak veya <span className="text-primary font-semibold">takaslamak</span> istediğiniz ürünü listeleyin.
        </p>
      </div>

      <form action={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>İlan Detayları</CardTitle>
            <CardDescription>
              İlanınızın doğru kişilere ulaşması için bilgileri eksiksiz doldurun.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* İlan Türü ve Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>İlan Türü</Label>
                {/* listingType state ile yönetiliyor, form'a hidden input ile gönderiyoruz veya createListingAction'da logic kuruyoruz. */}
                {/* Shadcn Select onValueChange ile state güncelliyor. */}
                <Select onValueChange={setListingType} defaultValue="product">
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Ürün Satışı</SelectItem>
                    <SelectItem value="barter">Takas (Barter)</SelectItem>
                    <SelectItem value="job">İş İlanı (Eleman Arayan)</SelectItem>
                    <SelectItem value="service">Hizmet (Biçerdöver vb.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select name="category" defaultValue="ekipman">
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tahil">Tahıl & Hububat</SelectItem>
                    <SelectItem value="sebze">Sebze & Meyve</SelectItem>
                    <SelectItem value="hayvan">Hayvancılık</SelectItem>
                    <SelectItem value="ekipman">Tarım Ekipmanı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* TAKAS ÖZEL ALANI */}
            {listingType === "barter" && (
              <div className="bg-secondary/10 border border-secondary p-4 rounded-lg space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-secondary-foreground font-semibold">
                  <RefreshCw className="h-5 w-5" />
                  <Label htmlFor="barterDesc" className="text-base">Takas Koşulları</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ürününüzü ne ile takas etmek istersiniz?
                </p>
                <Input 
                  id="barterDesc" 
                  name="barterDesc"
                  placeholder="Örn: Yem karma makinesi veya 50 koyun ile takas olur." 
                  className="bg-background"
                />
              </div>
            )}

            {/* Başlık ve Açıklama */}
            <div className="space-y-2">
              <Label htmlFor="title">İlan Başlığı</Label>
              <Input id="title" name="title" placeholder="Örn: 10 Ton Kuru Fasulye" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea 
                id="description"
                name="description"
                placeholder="Ürününüzün detaylarını buraya yazın..." 
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Fiyat ve Miktar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {listingType === "barter" ? "Tahmini Değer (Opsiyonel)" : "Fiyat / Ücret"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₺</span>
                  <Input id="price" name="price" className="pl-7" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Miktar / Birim</Label>
                <div className="flex gap-2">
                  <Input id="amount" name="amount" placeholder="Örn: 500" />
                  <Select name="unit" defaultValue="kg">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="ton">Ton</SelectItem>
                      <SelectItem value="adet">Adet</SelectItem>
                      <SelectItem value="gun">Günlük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Konum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>İl</Label>
                <Select name="city" onValueChange={setSelectedCity}>
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
                <Select name="district" disabled={!selectedCity}>
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
              />
            </div>

            {/* Fotoğraf Yükleme */}
            <div className="space-y-2">
              <Label htmlFor="images">Fotoğraflar</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                    <Input id="images" name="images" type="file" multiple accept="image/*" className="cursor-pointer" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Birden fazla fotoğraf seçebilirsiniz. İlk fotoğraf kapak fotoğrafı olacaktır.
                </p>
              </div>
            </div>

            {/* Hata Mesajı */}
            {errorMessage && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                    {errorMessage}
                </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button variant="outline" type="button">İptal</Button>
            <Button size="lg" className="px-8" type="submit" disabled={isPending}>
              {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
              ) : (
                listingType === "barter" ? "Takas İlanını Yayınla" : "İlanı Yayınla"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
