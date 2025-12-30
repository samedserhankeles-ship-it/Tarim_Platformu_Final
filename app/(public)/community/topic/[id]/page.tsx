import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { ReplyForm } from "./reply-form" // Yanıt formu bileşeni (Client)
import { getCurrentUser } from "@/lib/auth"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function TopicDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser()
  
  // Görüntülenme sayısını artır (Server side)
  try {
      await prisma.forumTopic.update({
          where: { id: params.id },
          data: { views: { increment: 1 } }
      });
  } catch (e) {
      console.error("View increment failed", e);
  }

  const topic = await prisma.forumTopic.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      posts: {
        include: { author: true },
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!topic) notFound()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Back Button */}
      <Link href="/community">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" /> Forum'a Geri Dön
        </Button>
      </Link>

      {/* Ana Konu */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wider">{topic.category}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true, locale: tr })}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
        </div>

        <Card className="border-2 border-emerald-100 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-12 w-12 border">
                <AvatarImage src={topic.author.image || undefined} />
                <AvatarFallback>{topic.author.name?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{topic.author.name}</span>
                  <Badge variant="outline" className="text-[10px] h-4">{topic.author.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Konu Sahibi</p>
              </div>
            </div>
            <div className="prose prose-emerald max-w-none text-gray-800 leading-relaxed">
              {topic.content}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4 py-4">
          <Separator className="flex-1" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
            {topic.posts.length} YANIT
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Yanıtlar Listesi */}
        <div className="space-y-4">
          {topic.posts.map((post) => (
            <Card key={post.id} className="border shadow-sm hover:border-gray-300 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={post.author.image || undefined} />
                    <AvatarFallback>{post.author.name?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{post.author.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 opacity-70">{post.author.role}</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Yanıt Formu */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-bold mb-4">Bir Yanıt Yazın</h3>
          {currentUser ? (
            <ReplyForm topicId={topic.id} userImage={currentUser.image} />
          ) : (
            <div className="bg-muted p-6 rounded-xl text-center">
              <p className="text-muted-foreground mb-4">Forumda tartışmalara katılmak için giriş yapmalısınız.</p>
              <Link href="/auth/sign-in">
                <Button>Giriş Yap</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
