import { getUserProfile } from "@/app/actions/profile";
import ProfileForm from "./profile-form"; // Client Component ayırıyoruz
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function ProfilePage() {
  const user = await getUserProfile();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Tarihleri string'e çevirerek client component'e geçmek daha güvenli (Serialization uyarısı almamak için)
  const plainUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Profil Ayarları</h1>
            <p className="text-muted-foreground">
            Kişisel bilgilerinizi ve hesap tercihlerinizi buradan yönetebilirsiniz.
            </p>
        </div>
        <Link href={`/profil/${user.id}`} target="_blank">
            <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Profilimi Görüntüle
            </Button>
        </Link>
      </div>
      <ProfileForm user={plainUser} />
    </div>
  );
}