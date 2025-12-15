import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // AvatarImage de eklendi
import { MapPin, Calendar, User, MessageSquare, ArrowLeft, Share2, AlertTriangle, RefreshCw } from "lucide-react";
import { notFound } from "next/navigation";
import MessageButton from "./message-button"; // Doğru import edildi
import CallButton from "./call-button";
import { getCurrentUser } from "@/lib/auth";
import FavoriteButton from "@/components/favorite-button";
import { prisma } from "@/lib/prisma";
import ReportButton from "@/components/report-button"; // Import ReportButton
import type { Metadata } from "next";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingDetail(id);
  
  if (!listing) {
    return {
      title: "İlan Bulunamadı",
    };
  }

  const title = `${listing.title} - TarımPazar`;
  const description = listing.description.substring(0, 160);
  const image = listing.type === "product" 
    ? (listing as any).image || "/og-image.jpg"
    : "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

async function getListingDetail(id: string) {
  // ID formatı: "prod-clps..." veya "job-clps..."
  const [type, realId] = id.split("-");

  if (!realId) return null;

  if (type === "prod") {
    const product = await prisma.product.findUnique({
      where: { id: realId },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            createdAt: true,
            phone: true, // Fetch user's phone
          }
        }
      }
    });
    if (!product) return null;
    return { ...product, type: "product" as const };
  } 
  
  if (type === "job") {
    const job = await prisma.jobPosting.findUnique({
      where: { id: realId },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            createdAt: true,
            phone: true, // Fetch user's phone
          }
        }
      }
    });
    if (!job) return null;
    return { ...job, type: "job" as const };
  }

  return null;
}

export default async function ListingDetailPage(props: { params: Promise<{ id: string }> }) { // Params artık bir Promise
  const params = await props.params;
  const listing = await getListingDetail(params.id);
  const currentUser = await getCurrentUser();

  if (!listing) {
    notFound();
  }

  const isBarter = listing.type === "product" && listing.description.includes("[TAKAS:");
  // @ts-ignore - Prisma tipleri dynamic return ile bazen karışabilir, basitleştiriyoruz
  const price = listing.type === "product" ? listing.price : listing.wage;
  // @ts-ignore
  const location = listing.type === "product" ? (listing.city ? `${listing.city}, ${listing.district}` : "Konum Bilgisi Alınamadı") : 
                   (listing.city ? `${listing.city}, ${listing.district}` : (listing.location || "Konum Bilgisi Alınamadı"));
  // @ts-ignore
  const image = listing.type === "product" && listing.images ? listing.images.split(",")[0] : 
                (listing.type === "job" && listing.images ? listing.images.split(",")[0] :
                (listing.type === "job" ? "https://placehold.co/800x600/blue/white?text=Is+Ilani" : 
                "https://placehold.co/800x600/green/white?text=Urun"));
  // @ts-ignore
  const contactPhoneNumber = listing.contactPhone || listing.user.phone;

  const isFavorited = currentUser ? await prisma.favorite.findFirst({
    where: {
        userId: currentUser.id,
        ...(listing.type === "product" ? { productId: listing.id } : { jobPostingId: listing.id })
    }
  }) : null;

  // Block Check
  let hasBlocked = false; // Current user blocked the seller
  let isBlockedBy = false; // Seller blocked the current user

  if (currentUser && currentUser.id !== listing.userId) {
      const blockRelation = await prisma.block.findUnique({
          where: {
              blockerId_blockedId: {
                  blockerId: currentUser.id,
                  blockedId: listing.userId
              }
          }
      });
      hasBlocked = !!blockRelation;

      const blockedByRelation = await prisma.block.findUnique({
          where: {
              blockerId_blockedId: {
                  blockerId: listing.userId,
                  blockedId: currentUser.id
              }
          }
      });
      isBlockedBy = !!blockedByRelation;
  }

  const canContact = !hasBlocked && !isBlockedBy;

  // Structured Data for Product/Job Listing
  const structuredData = {
    "@context": "https://schema.org",
    "@type": listing.type === "product" ? "Product" : "JobPosting",
    "name": listing.title,
    "description": listing.description,
    ...(listing.type === "product" ? {
      "offers": {
        "@type": "Offer",
        "price": (listing as any).price,
        "priceCurrency": "TRY",
        "availability": "https://schema.org/InStock",
      },
      "category": (listing as any).category,
    } : {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "TRY",
        "value": {
          "@type": "QuantitativeValue",
          "value": (listing as any).wage,
          "unitText": "MONTH"
        }
      },
      "employmentType": (listing as any).workType,
    }),
    "datePosted": listing.createdAt.toISOString(),
    "location": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": listing.type === "product" 
          ? ((listing as any).city || "")
          : ((listing as any).city || ""),
        "addressRegion": listing.type === "product"
          ? ((listing as any).district || "")
          : ((listing as any).district || ""),
      }
    },
    "image": image,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-6">
          <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            İlanlara Dön
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery (Single Image for now) */}
            <div className="rounded-2xl overflow-hidden bg-background border shadow-sm aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={image} 
                alt={listing.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                 {isBarter ? (
                    <Badge className="bg-purple-600 text-white border-purple-600 px-3 py-1 text-sm">
                        <RefreshCw className="mr-1 h-3 w-3" /> Takas Teklifi
                    </Badge>
                 ) : (
                    <Badge className="bg-background/90 text-foreground backdrop-blur px-3 py-1 text-sm">
                        {listing.type === "job" ? "İş İlanı" : "Satılık"}
                    </Badge>
                 )}
              </div>
            </div>

            {/* Title & Description */}
            <div className="bg-card rounded-2xl p-6 md:p-8 border shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                        {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 shrink-0">
                        <FavoriteButton 
                            listingId={listing.id} 
                            type={listing.type} 
                            initialIsFavorited={!!isFavorited} 
                        />
                        <Button variant="ghost" size="icon">
                            <Share2 className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4" /> {location}
                    </span>
                    <span className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" /> {listing.createdAt.toLocaleDateString("tr-TR")}
                    </span>
                </div>

                <Separator />

                <div className="prose prose-stone max-w-none dark:prose-invert">
                    <h3 className="text-lg font-semibold mb-2">Açıklama</h3>
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {(() => {
                            let displayDescription = listing.description;
                            if (isBarter) {
                                // Attempt to remove "[TAKAS: ... ]" from the beginning of the description
                                const regex = /^\[TAKAS:.*?\]\s*/i; 
                                displayDescription = displayDescription.replace(regex, '').trim();
                                // Fallback for simpler "[TAKAS:" prefix if regex didn't match (e.g., no closing bracket)
                                if (displayDescription.startsWith("[TAKAS:")) {
                                    displayDescription = displayDescription.substring("[TAKAS:".length).trim();
                                }
                            }
                            return displayDescription;
                        })()}
                    </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">
            
            {/* Price Card */}
            <Card className="border-none shadow-md overflow-hidden">
                <div className={`p-6 ${isBarter ? 'bg-purple-600 text-white' : 'bg-primary text-primary-foreground'}`}>
                    <p className="text-sm opacity-90 mb-1">
                        {isBarter ? "Takas Değeri / Koşulu" : "Fiyat"}
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                        {isBarter ? "Teklif Usulü" : `${price} ₺`}
                    </p>
                </div>
                <CardContent className="p-6 grid gap-3">
                    {canContact ? (
                        <>
                            <MessageButton receiverId={listing.userId} listingTitle={listing.title} currentUserId={currentUser?.id} />
                            <CallButton phoneNumber={contactPhoneNumber} isLoggedIn={!!currentUser} />
                        </>
                    ) : (
                         <div className="p-3 text-center text-sm bg-red-50 text-red-600 rounded-lg border border-red-100">
                            {hasBlocked ? "Bu kullanıcıyı engellediniz." : "Bu kullanıcıya ulaşamazsınız."}
                         </div>
                    )}
                </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                            <AvatarImage src={listing.user.image || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                {listing.user.name ? listing.user.name.substring(0,2).toUpperCase() : "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-lg">{listing.user.name || "Kullanıcı"}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {listing.user.role?.toLowerCase() || "Üye"}
                            </p>
                        </div>
                    </div>
                    <Separator className="mb-4" />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Üyelik Tarihi: {listing.user.createdAt.toLocaleDateString("tr-TR")}</span>
                        </div>
                        {/* Report Button */}
                        {currentUser && currentUser.id !== listing.userId && (
                            <ReportButton reportedUserId={listing.userId} isLoggedIn={!!currentUser} className="w-full" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Safety Tips */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-100 dark:border-yellow-900/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Güvenli Ticaret İpuçları</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        <li>Ödemeyi ürünü görmeden yapmayın.</li>
                        <li>Kişisel verilerinizi paylaşırken dikkatli olun.</li>
                    </ul>
                </div>
            </div>

          </div>
        </div>
      </div>
      </div>
    </>
  );
}