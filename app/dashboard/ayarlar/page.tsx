import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap güvenliği ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* Güvenlik Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle>Güvenlik</CardTitle>
            <CardDescription>
              Şifrenizi ve hesabınıza giriş yöntemlerinizi güncelleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Şifreyi Güncelle</Button>
          </CardFooter>
        </Card>

        {/* Bildirim Tercihleri */}
        <Card>
          <CardHeader>
            <CardTitle>Bildirimler</CardTitle>
            <CardDescription>
              Hangi durumlarda bildirim almak istediğinizi seçin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications-marketing" className="flex flex-col space-y-1">
                <span>Pazarlama E-postaları</span>
                <span className="font-normal text-xs text-muted-foreground">Yeni özellikler ve kampanyalar hakkında bilgi alın.</span>
              </Label>
              <Switch id="notifications-marketing" />
            </div>
            <Separator />
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications-messages" className="flex flex-col space-y-1">
                <span>Yeni Mesajlar</span>
                <span className="font-normal text-xs text-muted-foreground">Size biri mesaj gönderdiğinde bildirim alın.</span>
              </Label>
              <Switch id="notifications-messages" defaultChecked />
            </div>
            <Separator />
             <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications-security" className="flex flex-col space-y-1">
                <span>Güvenlik Uyarıları</span>
                <span className="font-normal text-xs text-muted-foreground">Hesabınıza şüpheli girişlerde e-posta alın.</span>
              </Label>
              <Switch id="notifications-security" defaultChecked disabled />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
             <Button variant="outline">Tercihleri Kaydet</Button>
          </CardFooter>
        </Card>

        {/* Tehlikeli Bölge */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Tehlikeli Bölge</CardTitle>
            <CardDescription>
              Bu işlemler geri alınamaz. Lütfen dikkatli olun.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
               <div className="space-y-1">
                 <p className="font-medium">Hesabı Sil</p>
                 <p className="text-sm text-muted-foreground">Hesabınızı ve tüm verilerinizi kalıcı olarak siler.</p>
               </div>
               <Button variant="destructive">Hesabı Sil</Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
