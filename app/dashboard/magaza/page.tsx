import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import StoreSettingsForm from "./StoreSettingsForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Store, ExternalLink } from "lucide-react";

export default async function StoreSettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (user.role !== "BUSINESS") {
    redirect("/dashboard"); 
  }
  
  const plainUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Mağaza Yönetimi</h1>
            <p className="text-muted-foreground">
            Vitrin bilgilerinizi güncelleyin ve mağazanızı yönetin.
            </p>
        </div>
        <Link href={`/magaza/${user.id}`} target="_blank">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Store className="h-4 w-4" />
                Mağazamı Görüntüle
                <ExternalLink className="h-4 w-4 opacity-70" />
            </Button>
        </Link>
      </div>

      <div className="grid gap-6">
         {/* İleride buraya mağaza istatistikleri vs. eklenebilir */}
         <StoreSettingsForm user={plainUser} />
      </div>
    </div>
  );
}
