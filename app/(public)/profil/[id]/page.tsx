import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, Calendar, User, MessageSquare, ArrowRightLeft, 
  Briefcase, Plus, UserX, Tractor, LayoutGrid, Newspaper, 
  Image as ImageIcon, MessageSquareText 
} from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ReportButton from "@/components/report-button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import StoreProfileCard from "@/components/StoreProfileCard";
import Link from "next/link";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FeedWrapper from "@/components/social/FeedWrapper";
import { PostCard } from "@/components/social/post-card";

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
      },
      _count: {
          select: {
              followers: true,
              following: true,
              posts: true,
              products: true,
              jobPostings: true
          }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Gönderileri ayrı çek (Prisma Client mismatch riskine karşı güvenli yöntem)
  let posts: any[] = [];
  let forumTopics: any[] = [];
  let forumPosts: any[] = [];

  try {
      // @ts-ignore
      if (prisma.socialPost) {
          // @ts-ignore
          posts = await prisma.socialPost.findMany({
              where: { userId: params.id },
              orderBy: { createdAt: "desc" },
              include: {
                  user: { select: { id: true, name: true, image: true } },
                  likes: true,
                  comments: {
                      include: { user: { select: { id: true, name: true, image: true } } },
                      orderBy: { createdAt: "asc" }
                  }
              }
          });
      }

      // @ts-ignore
      if (prisma.forumTopic) {
          // @ts-ignore
          forumTopics = await prisma.forumTopic.findMany({
              where: { authorId: params.id },
              orderBy: { createdAt: "desc" },
              include: {
                  _count: { select: { posts: true } }
              }
          });
      }

      // @ts-ignore
      if (prisma.forumPost) {
          // @ts-ignore
          forumPosts = await prisma.forumPost.findMany({
              where: { authorId: params.id },
              orderBy: { createdAt: "desc" },
              include: {
                  topic: { select: { title: true, id: true } }
              }
          });
      }
  } catch (error) {
      console.error("Failed to fetch social/forum data:", error);
  }

  const plainUser = {
    ...user,
    posts: posts.map((post: any) => ({
        ...post,
        createdAt: post.createdAt.toISOString()
    })),
    forumTopics: forumTopics.map((t: any) => ({ ...t, createdAt: t.createdAt.toISOString() })),
    forumPosts: forumPosts.map((p: any) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    createdAt: user.createdAt.toISOString(),
  };

  const plainCurrentUser = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role
  } : null;

  const isBusinessAccount = plainUser.role === 'BUSINESS';

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

  let initialIsFollowing = false;
  if (currentUser && currentUser.id !== user.id) {
      const follow = await prisma.follow.findUnique({
          where: {
              followerId_followingId: {
                  followerId: currentUser.id,
                  followingId: user.id
              }
          }
      });
      initialIsFollowing = !!follow;
  }

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
      location: j.city ? `${j.city}, ${j.district}` : "Konum Bilgisi Yok",
      createdAt: j.createdAt
    }))
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const isOwnProfile = currentUser?.id === user.id;
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        
        <StoreProfileCard 
            user={{ 
                ...plainUser, 
                createdAt: new Date(plainUser.createdAt),
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
                numericId: user.numericId,
            }}
            currentUser={plainCurrentUser}
            initialIsBlocked={initialIsBlocked}
            initialIsFollowing={initialIsFollowing}
            showActions={true}
        />

        <Tabs defaultValue={isBusinessAccount ? "listings" : "posts"} className="w-full space-y-8">
            <div className="sticky top-16 z-20 bg-gray-50/95 backdrop-blur py-2">
                <TabsList className={`grid w-full max-w-lg mx-auto ${isBusinessAccount ? 'grid-cols-1' : 'grid-cols-3'} h-12 bg-white border shadow-sm rounded-full p-1`}>
                    {!isBusinessAccount && (
                        <TabsTrigger value="posts" className="rounded-full">
                            <Newspaper className="h-4 w-4 mr-2" />
                            Akış
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="listings" className="rounded-full">
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        İlanlar
                    </TabsTrigger>
                    {!isBusinessAccount && (
                        <TabsTrigger value="forum" className="rounded-full">
                            <MessageSquareText className="h-4 w-4 mr-2" />
                            Forum
                        </TabsTrigger>
                    )}
                </TabsList>
            </div>

            {/* AKIŞ SEKMESİ */}
            <TabsContent value="posts" className="max-w-2xl mx-auto focus-visible:outline-none">
                <FeedWrapper 
                    isOwnProfile={isOwnProfile}
                    userImage={plainUser.image}
                    userName={plainUser.name}
                />

                <div className="space-y-6 mt-6">
                    {plainUser.posts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Henüz gönderi yok</h3>
                            <p className="text-muted-foreground">Profilinizi canlandırmak için bir şeyler paylaşın.</p>
                        </div>
                    ) : (
                        plainUser.posts.map((post: any) => (
                            <PostCard 
                                key={post.id} 
                                post={post}
                                currentUserId={currentUser?.id}
                                isAdmin={isAdmin}
                            />
                        ))
                    )}
                </div>
            </TabsContent>

            {/* İLANLAR SEKMESİ */}
            <TabsContent value="listings" className="focus-visible:outline-none">
                {listings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed max-w-2xl mx-auto">
                        <Tractor className="h-8 w-8 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">Aktif ilan bulunmuyor</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((item) => (
                            <Card key={item.id} className="overflow-hidden flex flex-col h-full border hover:shadow-lg transition-all">
                                <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image || "https://placehold.co/400x300?text=Ilan"} alt={item.title} className="object-cover w-full h-full" />
                                    <div className="absolute top-3 right-3">
                                        <Badge variant={item.isBarter ? "default" : "secondary"}>
                                            {item.isBarter ? "Takas" : (item.type === 'job' ? 'İş' : 'Ürün')}
                                        </Badge>
                                    </div>
                                </div>
                                <CardHeader className="p-4">
                                    <h3 className="font-bold line-clamp-2">{item.title}</h3>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1">
                                    <p className="text-lg font-bold text-primary">
                                        {item.isBarter ? "Takas Teklifi" : `${item.price} ${item.currency}`}
                                    </p>
                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                        <MapPin className="h-4 w-4 mr-1" /> {item.location}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 border-t flex justify-between">
                                    <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString("tr-TR")}</span>
                                    <Link href={`/ilan/${item.id}`}>
                                        <Button size="sm">İncele</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* FORUM SEKMESİ */}
            <TabsContent value="forum" className="max-w-2xl mx-auto focus-visible:outline-none">
                <div className="space-y-8">
                    {/* AÇILAN KONULAR */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MessageSquareText className="h-5 w-5 text-primary" />
                            Açılan Konular ({plainUser.forumTopics.length})
                        </h3>
                        {plainUser.forumTopics.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-white p-4 rounded-xl border border-dashed text-center">Henüz bir konu açılmamış.</p>
                        ) : (
                            <div className="space-y-3">
                                {plainUser.forumTopics.map((topic: any) => (
                                    <Link key={topic.id} href={`/forum/konu/${topic.id}`} className="block group">
                                        <Card className="p-4 hover:border-primary transition-colors">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{topic.title}</h4>
                                                <Badge variant="secondary">{topic.category}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                                <span>{new Date(topic.createdAt).toLocaleDateString("tr-TR")}</span>
                                                <span>•</span>
                                                <span>{topic._count.posts} Yanıt</span>
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    <Separator />

                    {/* YAPILAN YORUMLAR / YANITLAR */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Forum Yanıtları ({plainUser.forumPosts.length})
                        </h3>
                        {plainUser.forumPosts.length === 0 ? (
                            <p className="text-sm text-muted-foreground bg-white p-4 rounded-xl border border-dashed text-center">Henüz bir yanıt yazılmamış.</p>
                        ) : (
                            <div className="space-y-3">
                                {plainUser.forumPosts.map((fPost: any) => (
                                    <Link key={fPost.id} href={`/forum/konu/${fPost.topicId}`} className="block group">
                                        <Card className="p-4 hover:border-emerald-200 transition-colors bg-gray-50/50">
                                            <p className="text-xs text-muted-foreground mb-2 italic">
                                                "{fPost.topic.title}" konusuna yazdı:
                                            </p>
                                            <p className="text-sm line-clamp-2">{fPost.content}</p>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                {new Date(fPost.createdAt).toLocaleDateString("tr-TR")}
                                            </p>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}