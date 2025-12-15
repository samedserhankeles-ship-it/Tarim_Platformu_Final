import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ListingCard from "./listing-card";

// Veritabanından ilanları çeken fonksiyon
async function getUserListings(userId: string) {

  const [products, jobs] = await Promise.all([
    prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobPosting.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { products, jobs };
}

export default async function MyListingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { products, jobs } = await getUserListings(user.id);

  // İki listeyi birleştirip görüntü için formatlayalım
  const allListings = [
    ...products.map((p) => {
        const images = p.images ? p.images.split(",") : [];
        return {
            id: p.id,
            title: p.title,
            price: `${p.price} ₺`,
            location: "Konum Bilgisi", 
            status: p.active ? "active" : "passive",
            image: images[0] || p.image || "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image",
            date: p.createdAt.toLocaleDateString("tr-TR"),
            type: "product"
        };
    }),
    ...jobs.map((j) => {
        const images = j.images ? j.images.split(",") : [];
        return {
            id: j.id,
            title: j.title,
            price: `${j.wage} ₺`,
            location: j.location,
            status: j.active ? "active" : "passive",
            image: images[0] || "https://placehold.co/400x300/dbeafe/1e40af?text=Is+Ilani",
            date: j.createdAt.toLocaleDateString("tr-TR"),
            type: "job"
        };
    }),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">İlanlarım</h1>
          <p className="text-muted-foreground">
            Oluşturduğunuz ilanları buradan takip edebilir ve yönetebilirsiniz.
          </p>
        </div>
        <Link href="/dashboard/ilan-olustur">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Yeni İlan Ekle
          </Button>
        </Link>
      </div>

      {allListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
            <p className="text-muted-foreground mb-4">Henüz hiç ilan oluşturmadınız.</p>
            <Link href="/dashboard/ilan-olustur">
                <Button variant="outline">İlk İlanınızı Oluşturun</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allListings.map((listing) => (
                <ListingCard key={`${listing.type}-${listing.id}`} listing={listing} />
            ))}
        </div>
      )}
    </div>
  );
}
