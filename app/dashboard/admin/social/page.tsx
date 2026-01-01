import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, Ban, Search } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import DeletePostButton from "./delete-post-button"; // Client Component olacak

export default async function AdminSocialPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const currentUser = await getCurrentUser();
  const { q } = await searchParams;

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/");
  }

  const posts = await prisma.socialPost.findMany({
    where: {
        OR: q ? [
            { content: { contains: q } },
            { user: { name: { contains: q } } }
        ] : undefined
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        }
      },
      _count: {
          select: {
              likes: true,
              comments: true
          }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50 // Sayfalama eklenebilir
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sosyal Medya Yönetimi</h1>
        <div className="flex items-center gap-2">
            <form className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    name="q" 
                    placeholder="Gönderi veya kullanıcı ara..." 
                    className="pl-9 w-[300px]" 
                    defaultValue={q}
                />
            </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {posts.length === 0 ? (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Gönderi bulunamadı.
                </CardContent>
            </Card>
        ) : (
            posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            {/* Gönderi İçeriği */}
                            <div className="flex-1 p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={post.user.image || undefined} />
                                        <AvatarFallback>{post.user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link href={`/profil/${post.user.id}`} className="font-semibold hover:underline">
                                            {post.user.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {post.user.email} • {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: tr })}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="pl-12">
                                    <p className="text-sm">{post.content || "(Metin yok)"}</p>
                                    {post.media && (
                                        <div className="mt-2 h-20 w-20 rounded-md overflow-hidden bg-muted border">
                                            {post.mediaType === "VIDEO" ? (
                                                <video src={post.media} className="h-full w-full object-cover" />
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={post.media} alt="Medya" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pl-12 flex gap-4 text-xs text-muted-foreground">
                                    <span>{post._count.likes} Beğeni</span>
                                    <span>{post._count.comments} Yorum</span>
                                </div>
                            </div>

                            {/* Aksiyonlar */}
                            <div className="bg-muted/30 p-6 flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l min-w-[150px]">
                                <Link href={`/social/${post.id}`} target="_blank">
                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                        <Eye className="mr-2 h-4 w-4" /> İncele
                                    </Button>
                                </Link>
                                
                                <DeletePostButton postId={post.id} />
                                
                                <Link href={`/dashboard/users?q=${post.user.email}`}>
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-600">
                                        <Ban className="mr-2 h-4 w-4" /> Kullanıcıyı Yönet
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))
        )}
      </div>
    </div>
  );
}
