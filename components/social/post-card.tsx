"use client"

import { useState, useTransition, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash2, Heart, MessageCircle, Share2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePostAction, toggleLikeAction, createCommentAction, deleteCommentAction } from "@/app/actions/social"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Comment {
    id: string
    content: string
    createdAt: Date | string
    user: {
        id: string
        name: string | null
        image: string | null
    }
}

interface PostCardProps {
  post: {
    id: string
    content: string | null
    media: string | null
    mediaType: string
    createdAt: Date | string
    user: {
      id: string
      name: string | null
      image: string | null
    }
    likes: { userId: string }[]
    comments: Comment[]
  }
  currentUserId?: string
  isAdmin?: boolean
}

export function PostCard({ post, currentUserId, isAdmin }: PostCardProps) {
  const [isPending, startTransition] = useTransition()
  
  // Beğeni State'i (Optimistic UI için)
  const [liked, setLiked] = useState(post.likes.some(like => like.userId === currentUserId))
  const [likeCount, setLikeCount] = useState(post.likes.length)
  
  // Yorum State'i
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<Comment[]>(post.comments) // Optimistic comments

  const handleDeletePost = () => {
    if(!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
    
    startTransition(async () => {
      const result = await deletePostAction(post.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleLike = async () => {
      if (!currentUserId) {
          toast.error("Beğenmek için giriş yapmalısınız.")
          return
      }

      // Optimistic Update
      const previousLiked = liked
      const previousCount = likeCount
      
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)

      const result = await toggleLikeAction(post.id)
      
      if (!result.success) {
          // Revert if failed
          setLiked(previousLiked)
          setLikeCount(previousCount)
          toast.error(result.message)
      }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!commentText.trim() || !currentUserId) return

      const tempId = Math.random().toString() // Geçici ID
      
      // Optimistic update için geçici yorum ekle (opsiyonel, burada sadece backend bekleyelim daha güvenli)
      // Ancak kullanıcı deneyimi için bekletmek yerine loading gösterebiliriz.
      
      startTransition(async () => {
          const result = await createCommentAction(post.id, commentText)
          if (result.success) {
              setCommentText("")
              toast.success("Yorum gönderildi")
              // Not: Gerçek zamanlı güncelleme için router.refresh() actions içinde yapılıyor,
              // bu sayede comments prop'u güncellenecek.
          } else {
              toast.error(result.message)
          }
      })
  }
  
  const handleDeleteComment = async (commentId: string) => {
      if(!confirm("Yorumu silmek istiyor musunuz?")) return;
      
      startTransition(async () => {
          const result = await deleteCommentAction(commentId)
          if(result.success) {
              toast.success(result.message)
          } else {
              toast.error(result.message)
          }
      })
  }

  const isOwner = currentUserId === post.user.id
  const canDelete = isOwner || isAdmin

  return (
    <Card className="mb-4 overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.user.image || undefined} />
          <AvatarFallback>{post.user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-sm truncate">{post.user.name}</h3>
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr })}
                </p>
            </div>
            {(canDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleDeletePost}>
                    <Trash2 className="mr-2 h-4 w-4" /> Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 space-y-3">
        {post.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>}
        
        {post.media && (
          <div className="rounded-lg overflow-hidden bg-muted/50 border flex justify-center items-center max-h-[500px]">
            {post.mediaType === "VIDEO" ? (
              <video src={post.media} controls className="w-full h-full max-h-[500px] object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.media} alt="Post media" className="w-full h-full max-h-[500px] object-contain" />
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-0 flex flex-col border-t bg-muted/5">
        {/* Action Buttons */}
        <div className="flex w-full">
            <Button 
                variant="ghost" 
                className={cn("flex-1 rounded-none h-12 gap-2", liked && "text-red-600 hover:text-red-700 hover:bg-red-50")}
                onClick={handleLike}
            >
                <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                <span className="text-sm">{likeCount > 0 ? likeCount : "Beğen"}</span>
            </Button>
            
            <Button 
                variant="ghost" 
                className="flex-1 rounded-none h-12 gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowComments(!showComments)}
            >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm">{comments.length > 0 ? comments.length : "Yorum"}</span>
            </Button>
            
            <Button 
                variant="ghost" 
                className="flex-1 rounded-none h-12 gap-2 text-muted-foreground hover:text-foreground"
            >
                <Share2 className="h-5 w-5" />
                <span className="text-sm hidden sm:inline">Paylaş</span>
            </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
            <div className="w-full border-t bg-white p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>S</AvatarFallback> {/* Current user fallback */}
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                        <Input 
                            placeholder="Bir yorum yaz..." 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 min-h-[40px]"
                        />
                        <Button type="submit" size="icon" disabled={!commentText.trim() || isPending}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4 mt-4">
                    {comments.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-2">Henüz yorum yok. İlk yorumu sen yap!</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 group">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src={comment.user.image || undefined} />
                                    <AvatarFallback>{comment.user.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <div className="bg-muted/50 p-3 rounded-2xl rounded-tl-none">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-semibold">{comment.user.name}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.createdAt), { locale: tr })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground/90 break-words">{comment.content}</p>
                                    </div>
                                    {(currentUserId === comment.user.id || isAdmin || isOwner) && (
                                        <div className="flex gap-4 px-2">
                                            <button 
                                                className="text-xs text-muted-foreground hover:text-red-600 transition-colors"
                                                onClick={() => handleDeleteComment(comment.id)}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
      </CardFooter>
    </Card>
  )
}