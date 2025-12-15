import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import FavoritesClient from "./favorites-client";
import { prisma } from "@/lib/prisma";

async function getData(userId: string) {
  const [favorites, groups] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: {
        product: { include: { user: true } },
        jobPosting: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.favoriteGroup.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" }
    })
  ]);

  return { favorites, groups };
}

export default async function FavoritesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/sign-in");
  }

  const { favorites, groups } = await getData(currentUser.id);

  // Veriyi düzleştir
  const formattedFavorites = favorites.map((fav) => {
    let item = null;
    if (fav.product) {
        const p = fav.product;
        const isBarter = p.description.includes("[TAKAS:");
        item = {
            id: `prod-${p.id}`,
            title: p.title,
            price: isBarter ? "Takas Teklifi" : `${p.price} ₺`,
            location: p.city ? `${p.city}, ${p.district}` : "Konum Bilgisi", 
            type: isBarter ? "Takas" : "Ürün",
            image: p.image || (isBarter ? "https://placehold.co/400x300/purple/white?text=Takas" : "https://placehold.co/400x300/green/white?text=Urun"),
            category: p.category,
            isBarter: isBarter,
            userName: p.user.name || "Kullanıcı"
        };
    } else if (fav.jobPosting) {
        const j = fav.jobPosting;
        item = {
            id: `job-${j.id}`,
            title: j.title,
            price: `${j.wage} ₺ / Ay`, 
            location: j.city ? `${j.city}, ${j.district}` : (j.location || "Konum Bilgisi"),
            type: "İş İlanı",
            image: j.images ? j.images.split(",")[0] : "https://placehold.co/400x300/blue/white?text=Is+Ilani",
            category: "İş Gücü",
            isBarter: false,
            userName: j.user.name || "İşveren"
        };
    }
    
    if (!item) return null;

    return {
        favoriteId: fav.id, // Favori kaydının ID'si
        groupId: fav.groupId,
        ...item
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <FavoritesClient favorites={formattedFavorites} groups={groups} />
  );
}