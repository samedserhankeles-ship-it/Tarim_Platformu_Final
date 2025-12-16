import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StoreSettingsForm from "./StoreSettingsForm"; // Yeni Client Component'i import et

export default async function StoreSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Sadece BUSINESS rolündeki kullanıcılar bu sayfaya erişebilir
  if (user.role !== "BUSINESS") {
    redirect("/dashboard"); // Veya başka bir hata sayfası
  }
  
  // user objesini düz metin (plain object) olarak geçirmek
  const plainUser = {
    ...user,
    createdAt: user.createdAt.toISOString(), // Date objelerini stringe çevir
    updatedAt: user.updatedAt.toISOString(), // Date objelerini stringe çevir
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mağaza Ayarları</h1>
        <p className="text-muted-foreground">
          İşletmenize ait profil bilgilerini buradan yönetebilirsiniz.
        </p>
      </div>

      <StoreSettingsForm user={plainUser} />
    </div>
  );
}
