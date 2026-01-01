import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, User, Store, ArrowRight, LayoutGrid, Tractor, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SortSelect } from "@/components/ui/sort-select";

export default async function StorePage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ sort?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const currentUser = await getCurrentUser();
  
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      products: {
        where: { active: true },
      },
      jobPostings: {
        where: { active: true },
      },
      _count: {
          select: {
              followers: true,
              products: true,
              jobPostings: true
          }
      }
    }
  });

  if (!user || user.role !== 'BUSINESS') {
    notFound(); 
  }

  let listings = [
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
      location: j.city ? `${j.city}, ${j.district}` : "Konum Bilgisi Yok",
      createdAt: j.createdAt
    }))
  ];

  // Sorting Logic
  const sort = searchParams.sort || "newest";

  listings.sort((a, b) => {
      switch (sort) {
          case "price_asc":
              return a.price - b.price;
          case "price_desc":
              return b.price - a.price;
          case "oldest":
              return a.createdAt.getTime() - b.createdAt.getTime();
          case "newest":
          default:
              return b.createdAt.getTime() - a.createdAt.getTime();
      }
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Store Header / Banner */}
      <div className="bg-white border-b">
          <div className="h-48 md:h-64 relative overflow-hidden">
             {user.coverImage ? (
                 // eslint-disable-next-line @next/next/no-img-element
                 <img src={user.coverImage} alt="Kapak" className="w-full h-full object-cover" />
             ) : (
                 <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600"></div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 relative">
              <div className="-mt-16 mb-6 flex flex-col md:flex-row items-end md:items-center gap-6">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg bg-white">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="text-2xl">{user.name?.[0] || "M"}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 pb-2">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                              <p className="text-muted-foreground flex items-center mt-1">
                                  <Store className="h-4 w-4 mr-1" />
                                  Resmi İşletme Hesabı
                                  <span className="mx-2">•</span>
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {user.city}, {user.district}
                              </p>
                          </div>
                          <div className="flex gap-3">
                              <Link href={`/profil/${user.id}`}>
                                  <Button variant="outline" className="gap-2">
                                      <User className="h-4 w-4" />
                                      Profil
                                  </Button>
                              </Link>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
            
            {/* Product Grid */}
            <div className="w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-primary" />
                        Tüm Ürünler ({listings.length})
                    </h2>
                    <SortSelect />
                </div>

                {listings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed">
                        <Tractor className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold">Vitrin Boş</h3>
                        <p className="text-muted-foreground">Bu mağaza henüz ürün listelememiş.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {listings.map((item) => (
                            <Card key={item.id} className="overflow-hidden flex flex-col h-full border hover:shadow-lg transition-all group">
                                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={item.image || "https://placehold.co/400x300?text=Ilan"} 
                                        alt={item.title} 
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                                    />
                                    <div className="absolute top-3 right-3">
                                        <Badge variant={item.isBarter ? "default" : "secondary"}>
                                            {item.isBarter ? "Takas" : (item.type === 'job' ? 'İş' : 'Ürün')}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="p-4">
                                    <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1">
                                    <p className="text-lg font-bold text-primary">
                                        {item.isBarter ? "Takas Teklifi" : `${item.price} ${item.currency}`}
                                    </p>
                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                        <MapPin className="h-4 w-4 mr-1" /> {item.location}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t flex justify-between bg-muted/5">
                                    <Link href={`/ilan/${item.id}`} className="w-full">
                                        <Button size="sm" className="w-full">İncele</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
