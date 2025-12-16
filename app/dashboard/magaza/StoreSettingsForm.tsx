"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { updateUserProfileAction } from "@/app/actions/profile";
import { toast } from "sonner";
import StoreProfileCard from "@/components/StoreProfileCard";
import { ImageUploadField } from "@/components/ImageUploadField";

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    phone: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    crops: string | null;
    certificates: string | null;
    website: string | null;
    addressDetail: string | null;
    image: string | null;
    coverImage: string | null;
    createdAt: string; 
}

export default function StoreSettingsForm({ user }: { user: UserData }) {
    const [isPending, startTransition] = useTransition();

    // Form alanları için state'ler
    const [website, setWebsite] = useState(user.website || "");
    const [addressDetail, setAddressDetail] = useState(user.addressDetail || "");
    const [bio, setBio] = useState(user.bio || "");
    const [phone, setPhone] = useState(user.phone || "");
    const [city, setCity] = useState(user.city || "");
    const [district, setDistrict] = useState(user.district || "");
    
    // ImageUploadField'dan gelen dosya bilgilerini tutmak için
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);

    // Canlı önizleme için güncellenmiş user objesi
    const previewUser: UserData = {
        ...user,
        website: website,
        addressDetail: addressDetail,
        bio: bio,
        phone: phone,
        city: city,
        district: district,
        coverImage: selectedCoverFile ? URL.createObjectURL(selectedCoverFile) : user.coverImage,
        createdAt: user.createdAt,
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("website", website);
        formData.append("addressDetail", addressDetail);
        formData.append("bio", bio);
        formData.append("phone", phone);
        formData.append("city", city);
        formData.append("district", district);

        // updateUserProfileAction'ın beklediği diğer alanları FormData'ya ekle
        formData.append("name", user.name || "");
        formData.append("firstName", user.name?.split(' ')[0] || "");
        formData.append("lastName", user.name?.split(' ').slice(1).join(' ') || "");
        formData.append("email", user.email || "");
        formData.append("role", user.role || "");
        formData.append("crops", user.crops || "");
        formData.append("certificates", user.certificates || "");
        
        // coverImage dosyasını ekle
        if (selectedCoverFile) {
            formData.append("coverImage", selectedCoverFile);
        }

        startTransition(async () => {
            const result = await updateUserProfileAction(formData);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* Canlı Önizleme */}
            <div className="lg:sticky lg:top-8 self-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Canlı Önizleme</CardTitle>
                        <CardDescription>Mağazanızın nasıl göründüğünü anlık olarak görün.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <StoreProfileCard user={{ ...previewUser, createdAt: new Date(previewUser.createdAt) }} showActions={false} />
                    </CardContent>
                </Card>
            </div>

            {/* Ayar Formu */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>İşletme Bilgileri</CardTitle>
                        <CardDescription>
                            Müşterilerinizin mağazanız hakkında bilgi edinmesini sağlayın.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="website">Web Sitesi</Label>
                            <Input 
                                id="website" 
                                name="website" 
                                type="url" 
                                value={website} 
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://ornek.com" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addressDetail">Açık Adres</Label>
                            <Textarea 
                                id="addressDetail" 
                                name="addressDetail" 
                                value={addressDetail} 
                                onChange={(e) => setAddressDetail(e.target.value)}
                                placeholder="Mahalle, Sokak, No..." 
                                className="min-h-[80px]" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon Numarası</Label>
                            <Input 
                                id="phone" 
                                name="phone" 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="05XX XXX XX XX" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Hakkımızda</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="İşletmeniz hakkında kısa bir açıklama..."
                                className="min-h-[100px]"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">İl</Label>
                                <Input id="city" name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Örn: Konya" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="district">İlçe</Label>
                                <Input id="district" name="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Örn: Karatay" />
                            </div>
                        </div>

                        {/* Banner Yükleme Alanı */}
                        <div className="space-y-2 mt-4">
                            <ImageUploadField 
                                id="storeBanner"
                                name="coverImage"
                                label="Mağaza Banner Resmi"
                                defaultValue={previewUser.coverImage}
                                variant="banner"
                                currentValue={previewUser.coverImage}
                                onFileChange={setSelectedCoverFile}
                            />
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
        </div>
    );
}
