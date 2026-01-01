import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/social/post-card";
import { getCurrentUser } from "@/lib/auth";
import { Metadata } from "next";

export async function generateMetadata(
  props: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const post = await prisma.socialPost.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true } } }
  });

  if (!post) return { title: "Gönderi Bulunamadı" };

  return {
    title: `${post.user.name} tarafından paylaşılan gönderi - TarımPazar`,
    description: post.content?.substring(0, 160) || "TarımPazar sosyal akış gönderisi.",
  };
}

export default async function PostDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser();
  
  const post = await prisma.socialPost.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      likes: true,
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!post) {
    notFound();
  }

  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-xl font-bold mb-6">Gönderi</h1>
        <PostCard 
            post={{
                ...post,
                createdAt: post.createdAt.toISOString(),
                comments: post.comments.map(c => ({
                    ...c,
                    createdAt: c.createdAt.toISOString()
                }))
            }}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            defaultShowComments={true}
        />
        <div className="mt-8 text-center">
            <a href="/social" className="text-primary hover:underline text-sm font-medium">
                ← Akışa Geri Dön
            </a>
        </div>
      </div>
    </div>
  );
}
