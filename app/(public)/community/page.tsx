import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

const CATEGORIES = ["HEPSİ", "GENEL", "TARIM", "HAYVANCILIK", "TEKNOLOJİ", "PAZARLAMA"]

export default async function CommunityPage(props: { searchParams: Promise<{ cat?: string }> }) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.cat || "HEPSİ"
  
  let topics: any[] = [];
  let popularTopics: any[] = [];

  try {
    // @ts-ignore
    if (prisma.forumTopic) {
        // Tüm Konular
        // @ts-ignore
        topics = await prisma.forumTopic.findMany({
            where: currentCategory !== "HEPSİ" ? { category: currentCategory } : {},
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { id: true, name: true } },
                _count: { select: { posts: true } }
            }
        });

        // Popüler Konular
        // @ts-ignore
        popularTopics = await prisma.forumTopic.findMany({
            take: 5,
            orderBy: [
                { posts: { _count: 'desc' } },
                { views: 'desc' }
            ],
            include: {
                _count: { select: { posts: true } }
            }
        });
    }
  } catch (error) {
    console.error("Forum verileri çekilemedi:", error);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Topluluk Forumu</h1>
          <p className="text-muted-foreground mt-1">Tarım dünyasındaki gelişmeleri tartışın ve bilgi paylaşın.</p>
        </div>
        <Link href="/community/yeni-konu">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" /> Yeni Konu Aç
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL TARAF - KATEGORİLER (2/12) */}
        <aside className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-4 shadow-sm sticky top-24">
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest text-gray-400">Kategoriler</h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <Link key={cat} href={`/community?cat=${cat}`}>
                  <Button 
                    variant={currentCategory === cat ? "secondary" : "ghost"} 
                    className={`w-full justify-start font-medium text-sm px-3 ${currentCategory === cat ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : ''}`}
                  >
                    {cat}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* ORTA TARAF - KONU LİSTESİ (7/12) */}
        <main className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50/50 border-b p-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="col-span-8">Başlık</div>
              <div className="col-span-2 text-center">Yanıt</div>
              <div className="col-span-2 text-right">Zaman</div>
            </div>

            {/* Topics */}
            <div className="divide-y">
              {topics.length === 0 ? (
                <div className="p-16 text-center text-muted-foreground">
                  {/* @ts-ignore */}
                  {!prisma.forumTopic ? "Sistem güncelleniyor..." : "Henüz konu açılmamış."}
                </div>
              ) : (
                topics.map((topic) => (
                  <Link key={topic.id} href={`/community/topic/${topic.id}`} className="block hover:bg-gray-50/80 transition-colors">
                    <div className="md:grid md:grid-cols-12 items-center p-4 gap-4">
                      <div className="col-span-8 flex items-start gap-3">
                        <div className="bg-emerald-50 p-2 rounded-lg shrink-0 mt-0.5">
                          <MessageSquare className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2 hover:text-emerald-700 transition-colors">{topic.title}</h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1.5">
                            <span className="font-medium text-gray-600">{topic.author.name}</span>
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                                {topic.category}
                            </div>
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3 opacity-40" /> {topic.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 hidden md:flex flex-col items-center">
                        <span className="font-bold text-gray-700">{topic._count.posts}</span>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Yanıt</span>
                      </div>
                      <div className="col-span-2 hidden md:block text-right text-[11px] text-gray-400 font-medium">
                        {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: false, locale: tr })}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </main>

        {/* SAĞ TARAF - POPÜLER KONULAR (3/12) */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border p-5 shadow-sm sticky top-24 border-orange-100 bg-gradient-to-b from-white to-orange-50/10">
            <h3 className="font-bold mb-5 text-sm uppercase tracking-widest text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-500" /> Popüler Başlıklar
            </h3>
            <div className="space-y-5">
                {popularTopics.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">Henüz popüler konu yok.</p>
                ) : (
                    popularTopics.map((pt, index) => (
                        <Link key={pt.id} href={`/community/topic/${pt.id}`} className="flex gap-3 group items-start">
                            <span className="text-xl font-black text-gray-100 group-hover:text-orange-100 transition-colors leading-none pt-0.5">0{index + 1}</span>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold leading-snug text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                                    {pt.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" /> {pt._count.posts} Yanıt
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" /> {pt.views || 0} İzlenme
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
          </div>

          {/* Forum İstatistiği veya Yardım Kartı */}
          <div className="bg-emerald-900 rounded-xl p-5 text-white shadow-lg">
             <h4 className="font-bold text-sm mb-2">Yardıma mı ihtiyacınız var?</h4>
             <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Tarım hakkında merak ettiğiniz her şeyi topluluğumuza sorabilir, tecrübelerinizi paylaşabilirsiniz.
             </p>
             <Link href="/community/yeni-konu" className="block">
                <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs h-9">
                    SORU SOR
                </Button>
             </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}