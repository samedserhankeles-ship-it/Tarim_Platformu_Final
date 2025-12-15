import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Assuming a Card component exists or will be created
import { Button } from "@/components/ui/button"; // Assuming a Button component exists or will be created
import Link from "next/link";
import { DollarSign, MessageSquare, Tractor, Plus, User, FolderX, Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth"; // getCurrentUser fonksiyonunu import et

export default async function DashboardPage() { // Bileşeni async yap
  const user = await getCurrentUser(); // Kullanıcı bilgilerini al

  // If user is not found, redirect to login (should not happen due to layout check, but adding for safety)
  if (!user) {
    redirect("/auth/sign-in");
  }

  const userName = user.name || "Kullanıcı"; // Kullanıcı adını al veya varsayılan değer ata

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Merhaba, {userName}!</h1>
      <p className="text-muted-foreground">
        Panelinize hoş geldiniz. İşte son durumunuzun bir özeti.
      </p>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif İlanlar</CardTitle>
            <Tractor className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.activeListingsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Geçen haftadan 2 yeni ilan
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yeni Mesajlar</CardTitle>
            <MessageSquare className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.unreadNotificationCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Bugün 1 yeni mesaj aldınız
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif İlanlar</CardTitle>
            <FolderX className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.passiveListingsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Yayında olmayan ilanlarınız
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Favori Sayısı</CardTitle>
            <Heart className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.totalFavoritesCount ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              İlanlarınızın toplam beğeni sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/ilan-olustur">
          <Button className="w-full h-14 text-lg font-bold">
            <Plus className="mr-2 h-5 w-5" />
            Yeni İlan Oluştur
          </Button>
        </Link>
        <Link href="/dashboard/profil">
          <Button variant="outline" className="w-full h-14 text-lg font-bold">
            <User className="mr-2 h-5 w-5" />
            Profilimi Düzenle
          </Button>
        </Link>
        <Link href="/dashboard/mesajlar">
          <Button variant="secondary" className="w-full h-14 text-lg font-bold">
            <MessageSquare className="mr-2 h-5 w-5" />
            Mesajları Görüntüle
          </Button>
        </Link>
      </div>

      {/* This is a placeholder section for other dynamic content */}
      <div className="mt-8 p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-bold mb-4">Önemli Duyurular</h2>
        <p className="text-muted-foreground">
          Şu an için yeni duyuru bulunmamaktadır.
        </p>
      </div>
    </div>
  );
}

// NOTE: This page assumes the existence of Shadcn UI's Card and Button components.
// If not already present, you might need to add them.
// Example: npx shadcn-ui@latest add card button
