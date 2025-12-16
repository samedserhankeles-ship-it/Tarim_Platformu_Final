import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Briefcase, Mail, Tractor, ArrowRightLeft, Phone, Globe } from "lucide-react"; // Briefcase ikonu eklendi
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import StoreProfileCard from "@/components/StoreProfileCard"; // Yeni bileşen

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true }
  });

  if (!user) {
    return { title: "Kullanıcı Bulunamadı" };
  }

  return {
    title: `${user.name || "Kullanıcı"} Profili - TarımPazar`,
    description: `${user.name} kullanıcısının ilanlarını ve profilini inceleyin.`,
  };
}

export default async function ProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser();
  
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "desc" }
      },
      jobPostings: {
        where: { active: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Client Component'e prop olarak geçirmek için Date objelerini ISO string'e çevir.
  // currentUser da Client Component'e gideceği için benzer şekilde dönüştürülebilir.
  const plainUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  };

  const plainCurrentUser = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
  } : null;

  let initialIsBlocked = false;
  if (currentUser && currentUser.id !== user.id) {
      const block = await prisma.block.findUnique({
          where: {
              blockerId_blockedId: {
                  blockerId: currentUser.id,
                  blockedId: user.id
              }
          }
      });
      initialIsBlocked = !!block;
  }

  // Combine listings
  const listings = [
    ...user.products.map(p => ({
      id: `prod-${p.id}`,
      title: p.title,
      price: p.price,
      currency: p.currency,
      type: "product",
      category: p.category,
      image: p.images ? p.images.split(",")[0] : null,
      description: p.description,
      isBarter: p.description.includes("[TAKAS:"),
      location: p.city ? `${p.city}, ${p.district}` : "Konum Bilgisi Yok",
      createdAt: p.createdAt
    })),
    ...user.jobPostings.map(j => ({
      id: `job-${j.id}`,
      title: j.title,
      price: j.wage,
      currency: j.currency,
      type: "job",
      category: "İş İlanı",
      image: j.images ? j.images.split(",")[0] : null,
      description: j.description,
      isBarter: false,
      location: j.city ? `${j.city}, ${j.district}` : (j.location || "Konum Bilgisi Yok"),
      createdAt: j.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      <div className="mx-auto">
        
        <StoreProfileCard 
            user={{ 
                ...plainUser, 
                createdAt: new Date(plainUser.createdAt),
                // coverImage, website, addressDetail gibi yeni alanları da include et
                coverImage: user.coverImage,
                website: user.website,
                addressDetail: user.addressDetail,
                phone: user.phone,
                bio: user.bio,
                city: user.city,
                district: user.district,
                email: user.email,
                id: user.id,
                name: user.name,
                role: user.role,
            }}
            currentUser={plainCurrentUser}
            initialIsBlocked={initialIsBlocked}
            showActions={true}
        />

        {/* İlanlar Grid */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Tractor className="h-6 w-6 text-primary" />
            Kullanıcının İlanları 
            <span className="text-muted-foreground text-sm font-normal ml-2">({listings.length})</span>
        </h2>

        {listings.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Bu kullanıcının henüz aktif ilanı bulunmuyor.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                    <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow group flex flex-col ${item.isBarter ? 'border-purple-200 shadow-purple-100' : ''}`}>
                        <div className="aspect-video w-full overflow-hidden bg-muted relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={item.image || (item.isBarter ? "https://placehold.co/400x300/purple/white?text=Takas" : "https://placehold.co/400x300/green/white?text=Urun")} 
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2">
                            {item.isBarter ? (
                                <Badge className="bg-purple-600 hover:bg-purple-700 flex items-center gap-1">
                                    <ArrowRightLeft className="h-3 w-3" /> Takas
                                </Badge>
                            ) : (
                                <Badge className="bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/90">
                                    {item.type === 'job' ? 'İş İlanı' : 'Ürün'}
                                </Badge>
                            )}
                        </div>
                        </div>
                        <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                            <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                            </div>
                        </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1">
                        <div className="flex flex-col gap-2">
                            <p className={`text-lg font-bold ${item.isBarter ? 'text-purple-700' : 'text-primary'}`}>
                                {item.isBarter ? "Takas Teklifi" : `${item.price} ${item.currency}`}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.location}
                            </div>
                        </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 mt-auto border-t bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
                            <span>{item.createdAt.toLocaleDateString("tr-TR")}</span>
                            <Link href={`/ilan/${item.id}`}>
                            <Button size="sm" className={`h-8 ${item.isBarter ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`} variant={item.isBarter ? 'default' : 'secondary'}>
                                İncele
                            </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
