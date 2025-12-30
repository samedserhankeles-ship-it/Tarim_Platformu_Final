import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import FeedWrapper from "@/components/social/FeedWrapper"
import { PostCard } from "@/components/social/post-card"
import { Newspaper, TrendingUp, Users, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FollowButton } from "@/components/social/follow-button"

export const dynamic = "force-dynamic"

export default async function SocialFeedPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const searchParams = await props.searchParams;
  const currentTab = searchParams.tab || "all";
  const currentUser = await getCurrentUser()
  
  // Takip edilenlerin listesini al (Güvenli kontrol)
  let followingIds: string[] = []
  if (currentUser) {
      try {
          // @ts-ignore
          if (prisma.follow) {
              // @ts-ignore
              const follows = await prisma.follow.findMany({
                  where: { followerId: currentUser.id },
                  select: { followingId: true }
              })
              followingIds = follows.map((f: any) => f.followingId)
          }
      } catch (e) {
          console.error("Follow data fetch failed", e)
      }
  }

  let posts: any[] = []
  try {
    const whereClause: any = {}
    if (currentTab === "following" && currentUser) {
        whereClause.userId = { in: followingIds }
    }

    // @ts-ignore
    if (prisma.socialPost) {
        // @ts-ignore
        posts = await prisma.socialPost.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, image: true, role: true }
                },
                likes: true,
                comments: {
                    include: {
                        user: { select: { id: true, name: true, image: true } }
                    },
                    orderBy: { createdAt: "asc" }
                }
            }
        })
    }
  } catch (error) {
    console.error("Failed to fetch social feed:", error)
  }

  // Popüler forum konularını çek (Trend başlıklar için)
  let trendingTopics: any[] = []
  try {
      // @ts-ignore
      if (prisma.forumTopic) {
          // @ts-ignore
          trendingTopics = await prisma.forumTopic.findMany({
              take: 4,
              orderBy: [
                  { views: 'desc' },
                  { posts: { _count: 'desc' } }
              ],
              select: { id: true, title: true, _count: { select: { posts: true } } }
          })
      }
  } catch (e) {
      console.error("Trending topics fetch failed", e)
  }

  // Önerilen kullanıcılar (Sıralama eklendi - Hydration hatasını önlemek için)
  let suggestedUsers: any[] = []
  try {
      // @ts-ignore
      if (prisma.user) {
          suggestedUsers = await prisma.user.findMany({
              take: 5,
              where: {
                  AND: [
                      { NOT: { id: currentUser?.id } },
                      // @ts-ignore
                      prisma.follow ? { NOT: { followers: { some: { followerId: currentUser?.id } } } } : {}
                  ]
              },
              orderBy: { createdAt: 'desc' }, // Kararlı sıralama
              select: { id: true, name: true, image: true, role: true }
          })
      }
  } catch (e) {
      console.error("Suggested users fetch failed", e)
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SOL KOLON */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="bg-emerald-50/50 border-b pb-4">
                        <CardTitle className="text-xs uppercase tracking-widest text-emerald-700 flex items-center gap-2 font-black">
                            <TrendingUp className="h-4 w-4" /> Trend Başlıklar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-3">
                            {trendingTopics.length === 0 ? (
                                <p className="text-xs text-muted-foreground italic text-center py-4">Henüz trend başlık yok.</p>
                            ) : (
                                trendingTopics.map(topic => (
                                    <Link key={topic.id} href={`/community/topic/${topic.id}`} className="flex flex-col cursor-pointer group">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                                            #{topic.title.replace(/\s+/g, '').toLowerCase()}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                                            {topic._count.posts} Yanıt • Görüntüle
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-lg">
                    <h4 className="font-bold mb-2 text-lg">Topluluğun Kalbi</h4>
                    <p className="text-sm text-emerald-100/80 mb-4 leading-relaxed">
                        Takip ettiğin kişilerin neler paylaştığını gör ve sohbete katıl.
                    </p>
                </div>
            </div>
          </aside>

          {/* ORTA KOLON */}
          <main className="lg:col-span-6 space-y-6">
            <Tabs defaultValue={currentTab} className="w-full">
                <div className="flex items-center justify-between mb-4 border-b bg-white/50 backdrop-blur rounded-t-xl px-4">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                        <TabsTrigger 
                            value="all" 
                            asChild
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-0 pb-2 text-lg font-bold text-gray-400 data-[state=active]:text-gray-900 transition-all cursor-pointer"
                        >
                            <Link href="/social?tab=all" scroll={false}>Tüm Akış</Link>
                        </TabsTrigger>
                        {currentUser && (
                            <TabsTrigger 
                                value="following" 
                                asChild
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-0 pb-2 text-lg font-bold text-gray-400 data-[state=active]:text-gray-900 transition-all cursor-pointer"
                            >
                                <Link href="/social?tab=following" scroll={false}>Takip Ettiklerim</Link>
                            </TabsTrigger>
                        )}
                    </TabsList>
                </div>

                <TabsContent value={currentTab} className="mt-0 focus-visible:outline-none">
                    <div className="pt-4">
                        <FeedWrapper 
                            isOwnProfile={!!currentUser}
                            userImage={currentUser?.image}
                            userName={currentUser?.name}
                        />
                    </div>

                    <div className="space-y-6 mt-6">
                        {posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-dashed shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900">Henüz gönderi yok</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                    {currentTab === "following" 
                                        ? "Takip ettiğin kişiler henüz bir şey paylaşmamış." 
                                        : "Topluluk akışı henüz boş."}
                                </p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard 
                                    key={post.id}
                                    post={{
                                        ...post,
                                        createdAt: post.createdAt.toISOString()
                                    }}
                                    currentUserId={currentUser?.id}
                                    isAdmin={currentUser?.role === "ADMIN"}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
          </main>

          {/* SAĞ KOLON */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
            <div className="sticky top-24 space-y-6">
                <Card className="border shadow-sm">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-sm font-black uppercase tracking-wider text-gray-700 flex items-center justify-between">
                            Öneriler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {suggestedUsers.map((sUser) => (
                                <div key={sUser.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50/50 transition-colors">
                                    <Link href={`/profil/${sUser.id}`} className="flex items-center gap-3 group">
                                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={sUser.image || `https://ui-avatars.com/api/?name=${sUser.name}&background=10b981&color=fff`} alt={sUser.name || ""} className="h-full w-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-1">{sUser.name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{sUser.role}</p>
                                        </div>
                                    </Link>
                                    {/* @ts-ignore */}
                                    {prisma.follow && (
                                        <FollowButton 
                                            followingId={sUser.id} 
                                            initialIsFollowing={false} 
                                            size="sm"
                                            className="w-full h-8 text-[11px]"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}