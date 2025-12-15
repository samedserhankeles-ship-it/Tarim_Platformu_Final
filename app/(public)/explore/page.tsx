import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, RefreshCw, ArrowRightLeft, Tractor, Briefcase, Filter } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FilterSidebar } from "@/components/explore/FilterSidebar"; 
import { MobileFilterSheet } from "@/components/explore/MobileFilterSheet";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İlanlar",
  description: "Tarım sektöründe iş ilanları, ürün satışları ve takas teklifleri. Binlerce aktif ilan arasından aradığınızı bulun.",
  openGraph: {
    title: "Tarım İlanları - TarımPazar",
    description: "Tarım sektöründe iş ilanları, ürün satışları ve takas teklifleri. Binlerce aktif ilan arasından aradığınızı bulun.",
  },
};

// Veritabanından ilanları çeken fonksiyon
async function getListings(searchParams: { [key: string]: string | string[] | undefined }) {
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const typeParams = searchParams.type;
  const categoryParams = searchParams.category;
  
  // Location params
  const cityParam = typeof searchParams.city === "string" ? searchParams.city : undefined;
  const districtParam = typeof searchParams.district === "string" ? searchParams.district : undefined;
  // Fallback/Legacy generic location search
  const locationParam = typeof searchParams.location === "string" ? searchParams.location : undefined;

  const minPriceParam = typeof searchParams.minPrice === "string" ? parseFloat(searchParams.minPrice) : undefined;
  const maxPriceParam = typeof searchParams.maxPrice === "string" ? parseFloat(searchParams.maxPrice) : undefined;

  const typeFilter = Array.isArray(typeParams) ? typeParams : (typeParams ? [typeParams] : []);
  const categoryFilter = Array.isArray(categoryParams) ? categoryParams : (categoryParams ? [categoryParams] : []);

  const whereProduct: Prisma.ProductWhereInput = {
    active: true,
  };
  const whereJob: Prisma.JobPostingWhereInput = {
    active: true,
  };

  // Genel Arama
  if (search) {
    whereProduct.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { category: { contains: search } }
    ];
    whereJob.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } }
    ];
  }

  // Tip Filtresi
  if (typeFilter.length > 0) {
    const isProduct = typeFilter.includes("product");
    const isBarter = typeFilter.includes("barter");
    const isJob = typeFilter.includes("job");

    // Product filtering logic
    if (isProduct && isBarter) {
        // Show all products (both barter and sale) -> No additional filter needed
    } else if (isProduct) {
        // Only sale products (no barter)
        whereProduct.description = { not: { contains: "[TAKAS:" } };
    } else if (isBarter) {
        // Only barter products
        whereProduct.description = { contains: "[TAKAS:" };
    } else {
        // Neither product nor barter selected (e.g. only job selected)
        whereProduct.id = "no-match";
    }

    // Job filtering logic
    if (!isJob) {
        whereJob.id = "no-match";
    }
  }

  // Kategori Filtresi
  if (categoryFilter.length > 0) {
    whereProduct.category = { in: categoryFilter };
  }

  // Konum Filtresi (İl ve İlçe)
  if (cityParam) {
    whereProduct.city = cityParam;
    whereJob.city = cityParam;
  }
  
  if (districtParam) {
    whereProduct.district = districtParam;
    whereJob.district = districtParam;
  }

  // Eski tip genel konum araması (Eğer şehir/ilçe seçilmemişse)
  if (!cityParam && !districtParam && locationParam) {
    whereProduct.city = { contains: locationParam }; 
    whereJob.city = { contains: locationParam }; 
  }

  // Fiyat Aralığı Filtresi
  if (minPriceParam !== undefined || maxPriceParam !== undefined) {
    whereProduct.price = {};
    if (minPriceParam !== undefined) {
      (whereProduct.price as any).gte = minPriceParam;
    }
    if (maxPriceParam !== undefined) {
      (whereProduct.price as any).lte = maxPriceParam;
    }
    // İş ilanları için ücret filtrelemesi
    whereJob.wage = {};
    if (minPriceParam !== undefined) {
      (whereJob.wage as any).gte = minPriceParam;
    }
    if (maxPriceParam !== undefined) {
      (whereJob.wage as any).lte = maxPriceParam;
    }
  }


  // Ürünleri Çek
  const products = await prisma.product.findMany({
    where: whereProduct,
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  // İş İlanlarını Çek
  const jobs = await prisma.jobPosting.findMany({
    where: whereJob,
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return { products, jobs };
}

export default async function ExplorePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; 
}) {
  const searchParams = await props.searchParams || {};
  const { products, jobs } = await getListings(searchParams);

  // Listeleri birleştirip formatlayalım
  const allListings = [
    ...products.map((p) => {
        const isBarter = p.description.includes("[TAKAS:");
        const locationDisplay = [p.city, p.district].filter(Boolean).join(", ") || p.user.city || "Konum Bilgisi";
        
        return {
            id: `prod-${p.id}`,
            title: p.title,
            price: isBarter ? "Takas Teklifi" : `${p.price} ₺`,
            location: locationDisplay, 
            type: isBarter ? "Takas" : "Ürün",
            image: p.image || (isBarter ? "https://placehold.co/400x300/purple/white?text=Takas" : "https://placehold.co/400x300/green/white?text=Urun"),
            category: p.category,
            isBarter: isBarter,
            userName: p.user.name || "Kullanıcı"
        };
    }), 

    ...jobs.map((j) => {
      const locationDisplay = [j.city, j.district].filter(Boolean).join(", ") || j.location || j.user.city || "Konum Bilgisi";

      return {
        id: `job-${j.id}`,
        title: j.title,
        price: `${j.wage} ₺ / Ay`, 
        location: locationDisplay,
        type: "İş İlanı",
        image: "https://placehold.co/400x300/blue/white?text=Is+Ilani",
        category: "İş Gücü",
        isBarter: false,
        userName: j.user.name || "İşveren"
      };
    }), 
  ];

  const defaultSearchQuery = typeof searchParams.q === "string" ? searchParams.q : "";


  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      
      <div className="container mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden md:block"> 
          <FilterSidebar />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <MobileFilterSheet />
        </div>

        {/* Listings Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Güncel İlanlar</h1>
            <span className="text-muted-foreground text-sm hidden sm:inline">{allListings.length} ilan bulundu</span>
          </div>

          {allListings.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-dashed">
                <Tractor className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Sonuç Bulunamadı</h3>
                <p className="text-muted-foreground">Aradığınız kriterlere uygun ilan yok.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {allListings.map((item) => (
                <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer flex flex-col ${item.isBarter ? 'border-purple-200 shadow-purple-100' : ''}`}>
                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={item.image} 
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
                                {item.type}
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
                            {item.price}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        {item.location}
                        </div>
                    </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 mt-auto border-t bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {item.userName}
                        </span>
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
        </main>
      </div>
    </div>
  );
}