"use client"

import { CreatePost } from "./create-post"

interface FeedWrapperProps {
    userImage?: string | null
    userName?: string | null
    isOwnProfile: boolean
}

export default function FeedWrapper({ userImage, userName, isOwnProfile }: FeedWrapperProps) {
    if (!isOwnProfile) return null;

    return (
        <CreatePost 
            userImage={userImage}
            userName={userName}
        />
    )
}