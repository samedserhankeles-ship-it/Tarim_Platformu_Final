"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toggleFollowAction } from "@/app/actions/social"
import { toast } from "sonner"
import { UserPlus, UserMinus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
    followingId: string
    initialIsFollowing: boolean
    variant?: "default" | "outline" | "ghost" | "secondary"
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
    showText?: boolean
}

export function FollowButton({ 
    followingId, 
    initialIsFollowing, 
    variant = "default",
    className,
    size = "default",
    showText = true
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()

    const handleFollow = () => {
        startTransition(async () => {
            const result = await toggleFollowAction(followingId)
            if (result.success) {
                setIsFollowing(result.isFollowing ?? false)
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    return (
        <Button 
            variant={isFollowing ? "outline" : variant} 
            size={size}
            className={cn(
                "font-bold transition-all",
                !isFollowing && variant === "default" && "bg-emerald-600 hover:bg-emerald-700 text-white",
                isFollowing && "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-red-600 hover:border-red-200 group/follow",
                className
            )}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleFollow()
            }}
            disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus className="h-4 w-4 mr-2 group-hover/follow:inline hidden" />
                    <span className="group-hover/follow:inline hidden">Takipten Çık</span>
                    <span className="group-hover/follow:hidden inline">Takip Ediliyor</span>
                </>
            ) : (
                <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {showText && "Takip Et"}
                </>
            )}
        </Button>
    )
}
