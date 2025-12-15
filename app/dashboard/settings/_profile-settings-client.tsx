"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { turkeyLocations } from "@/lib/locations";
import { updateUserProfileAction } from "@/app/actions/profile"; // Server action for profile update
import { AVAILABLE_ROLES } from "@/lib/roles";

// This data would typically be passed from a Server Component parent
// For now, we'll simulate fetching it within the client component (which is fine for demo purposes
// but in a real app, prefer passing initial props from a Server Component wrapper)
interface UserProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  district: string | null;
  crops: string | null;
  certificates: string | null;
  role: string;
}

// Placeholder for fetching user data (in a real app, this would be a server component or an API call)
// Since this is a client component, we'll fetch via an API route or another server action if needed.
// For now, let's assume `getCurrentUser` can be safely used on the server side to pass initial props.
// As `page.tsx` is client, we'll create a wrapper Server Component for it.

export default function ProfileSettingsPage({ initialUserData }: { initialUserData: UserProfileData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialUserData.name || "");
  const [email, setEmail] = useState(initialUserData.email || "");
  const [role, setRole] = useState(initialUserData.role || "FARMER");
  const [phone, setPhone] = useState(initialUserData.phone || "");
  const [bio, setBio] = useState(initialUserData.bio || "");
  const [city, setCity] = useState(initialUserData.city || "");
  const [district, setDistrict] = useState(initialUserData.district || "");
  const [crops, setCrops] = useState(initialUserData.crops || "");
  const [certificates, setCertificates] = useState(initialUserData.certificates || "");
  const [preview, setPreview] = useState<string | null>(initialUserData.image);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const currentDistricts = turkeyLocations.find(loc => loc.city === city)?.districts || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreview(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // File'ı state'ten veya input'tan al ve FormData'ya ekle
    if (selectedFile) {
      formData.set("image", selectedFile);
    } else {
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.set("image", fileInput.files[0]);
      }
    }
    
    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(formData);
        if (result.success) {
          toast({ title: "Başarılı", description: result.message });
          router.refresh(); // Revalidate data across the app
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          toast({ title: "Hata", description: result.message, variant: "destructive" });
        }
      } catch (error) {
        console.error("Submit error:", error);
        toast({ title: "Hata", description: "Bir hata oluştu. Lütfen tekrar deneyin.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profil Ayarları</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgilerini Düzenle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-20 w-20 border-2 shadow-sm">
                  <AvatarImage src={preview || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {(initialUserData.name || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-5 w-5" />
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
              <div>
                <Label>Profil Fotoğrafı</Label>
                <p className="text-sm text-muted-foreground">Fotoğrafı değiştirmek için üzerine tıklayın.</p>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Fotoğrafı Değiştir
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Adı Soyadı</Label>
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isPending} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon Numarası</Label>
                <Input id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select onValueChange={setRole} value={role} disabled={isPending}>
                  <SelectTrigger className="w-full">
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
              <Label htmlFor="bio">Biyografi</Label>
              <Textarea id="bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Kendinizden bahsedin..." disabled={isPending} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">İl</Label>
                <Select onValueChange={(val) => { setCity(val); setDistrict(""); }} value={city} disabled={isPending}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="İl Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {turkeyLocations.map((loc) => (
                            <SelectItem key={loc.city} value={loc.city}>{loc.city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input type="hidden" name="city" value={city} /> {/* Hidden input for FormData */}
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">İlçe</Label>
                <Select onValueChange={setDistrict} value={district} disabled={isPending || !city}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="İlçe Seçiniz" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {currentDistricts.map((dist) => (
                            <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input type="hidden" name="district" value={district} /> {/* Hidden input for FormData */}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crops">Yetiştirdiğiniz Ürünler (Virgülle ayırın)</Label>
              <Input id="crops" name="crops" value={crops} onChange={(e) => setCrops(e.target.value)} placeholder="Örn: Buğday, Mısır, Domates" disabled={isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificates">Sertifikalarınız (Virgülle ayırın)</Label>
              <Input id="certificates" name="certificates" value={certificates} onChange={(e) => setCertificates(e.target.value)} placeholder="Örn: Organik Tarım, İyi Tarım Uygulamaları" disabled={isPending} />
            </div>

            <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Değişiklikleri Kaydet
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
