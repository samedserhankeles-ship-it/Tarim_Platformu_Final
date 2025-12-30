"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    MapPin, Calendar, Briefcase, Mail, Phone, Globe, Tractor, 
    User2, MessageSquare, Ban, Flag, Settings, MoreHorizontal, 
    ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import BlockButton from "@/components/block-button";
import ReportButton from "@/components/report-button";
import MessageButton from "@/components/message-button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { FollowButton } from "@/components/social/follow-button";
import { getFollowersAction, getFollowingAction } from "@/app/actions/social";
import { useState } from "react";

interface UserProfileData {
    id: string;
    numericId?: string | null;
    name: string | null;
    email: string;
    image: string | null;
    coverImage: string | null;
    phone: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    role: string;
    createdAt: Date;
    website: string | null;
    addressDetail: string | null;
    _count?: {
        followers: number;
        following: number;
    };
}

interface StoreProfileCardProps {
    user: UserProfileData;
    currentUser?: { id: string, name: string | null, email: string } | null;
    initialIsBlocked?: boolean;
    initialIsFollowing?: boolean;
    showActions?: boolean;
}

export default function StoreProfileCard({ 
    user, 
    currentUser, 
    initialIsBlocked, 
    initialIsFollowing = false,
    showActions = true 
}: StoreProfileCardProps) {
    const isBusinessProfile = user.role === "BUSINESS";
    
    // Liste State'leri
    const [listDialogOpen, setListDialogOpen] = useState(false);
    const [listTitle, setListTitle] = useState("");
    const [userList, setUserList] = useState<any[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(false);

    const openList = async (type: "followers" | "following") => {
        setIsLoadingList(true);
        setListTitle(type === "followers" ? "Takipçiler" : "Takip Edilenler");
        setUserList([]); // Reset list
        setListDialogOpen(true);
        
        const result = type === "followers" 
            ? await getFollowersAction(user.id) 
            : await getFollowingAction(user.id);
            
        if (result.success) {
            setUserList(result.data || []);
        }
        setIsLoadingList(false);
    };

    return (
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-sm border bg-card">
            {/* Banner Area */}
            <div className="relative h-64 md:h-80 overflow-hidden">
                {user.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={user.coverImage} 
                        alt="Kapak Resmi" 
                        className="h-full w-full object-cover" 
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
            </div>

            {/* Profil Bilgileri ve Avatar */}
            <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8 pt-0 -mt-24 md:-mt-32 flex flex-col md:flex-row items-center md:items-end gap-6">
                <Avatar className="h-28 w-28 md:h-40 md:w-40 border-4 border-background shadow-lg bg-primary/20">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="text-5xl bg-primary/10 text-primary">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left space-y-2 mb-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                        {user.name || "İsimsiz Kullanıcı"}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
                        {user.numericId && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 font-mono text-xs bg-background/50 border-emerald-100">
                                ID: {user.numericId}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="capitalize text-base px-3 py-1">
                            {user.role === "ADMIN" ? "Yönetici" : (user.role === "FARMER" ? "Çiftçi" : user.role?.toLowerCase() || "Üye")}
                        </Badge>
                        
                        {/* Takipçi Sayıları */}
                        <div className="flex items-center gap-4 px-3 py-1 rounded-full bg-muted/50 border border-muted-foreground/10 shadow-inner">
                            <div 
                                className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition-colors"
                                onClick={() => openList("followers")}
                            >
                                <span className="text-sm font-bold text-foreground">{user._count?.followers || 0}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-tighter font-medium">Takipçi</span>
                            </div>
                            <Separator orientation="vertical" className="h-3 bg-muted-foreground/20" />
                            <div 
                                className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition-colors"
                                onClick={() => openList("following")}
                            >
                                <span className="text-sm font-bold text-foreground">{user._count?.following || 0}</span>
                                <span className="text-xs text-muted-foreground uppercase tracking-tighter font-medium">Takip</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                        {user.createdAt && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="h-3 w-3" /> Katılım: {format(user.createdAt, "d MMMM yyyy", { locale: tr })}
                            </div>
                        )}
                        {(user.city || user.district) && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <MapPin className="h-3 w-3" /> {user.city}, {user.district}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Buttons */}
                {showActions && currentUser && currentUser.id !== user.id && (
                    <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto shrink-0 mb-4">
                        <FollowButton 
                            followingId={user.id} 
                            initialIsFollowing={initialIsFollowing} 
                            className="w-auto px-6 h-11 text-sm shadow-md"
                        />
                        <MessageButton 
                            receiverId={user.id} 
                            currentUserId={currentUser.id} 
                            className="w-auto h-11"
                            size="default"
                            variant="outline"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full border bg-white shadow-sm">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <BlockButton 
                                        userId={user.id} 
                                        initialIsBlocked={!!initialIsBlocked} 
                                        variant="ghost"
                                        className="w-full justify-start text-red-600"
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <ReportButton 
                                        reportedUserId={user.id} 
                                        isLoggedIn={!!currentUser} 
                                        variant="ghost" 
                                        className="w-full justify-start"
                                    />
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Hakkımızda / İletişim Bilgileri */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {user.bio && (
                        <Card className="mb-6 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User2 className="h-5 w-5 text-primary" /> Hakkımızda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-base text-muted-foreground leading-relaxed">
                                <div className="whitespace-pre-wrap">{user.bio}</div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {(user.email || user.phone || user.website || user.addressDetail) && (
                    <div className="md:col-span-1">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Mail className="h-5 w-5 text-primary" /> İletişim
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {user.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">E-posta</p>
                                            <Link href={`mailto:${user.email}`} className="hover:underline text-primary font-medium">{user.email}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">Telefon</p>
                                            <Link href={`tel:${user.phone}`} className="hover:underline text-primary font-medium">{user.phone}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">Web Sitesi</p>
                                            <Link href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary font-medium">{user.website}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.addressDetail && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600 mt-1">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">Adres</p>
                                            <div className="whitespace-pre-wrap text-muted-foreground font-medium">{user.addressDetail}</div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Liste Diyaloğu */}
            <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
                <DialogContent className="max-w-sm rounded-2xl overflow-hidden p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-center text-lg font-bold">{listTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {isLoadingList ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
                                <p className="text-sm text-muted-foreground mt-2">Yükleniyor...</p>
                            </div>
                        ) : userList.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <User2 className="h-12 w-12 mx-auto opacity-20 mb-2" />
                                <p className="text-sm">Henüz kimse yok.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {userList.map((u) => (
                                    <Link 
                                        key={u.id} 
                                        href={`/profil/${u.id}`}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors group"
                                        onClick={() => setListDialogOpen(false)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border shadow-sm">
                                                <AvatarImage src={u.image || undefined} />
                                                <AvatarFallback>{u.name?.[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold group-hover:text-emerald-600 transition-colors">{u.name}</p>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{u.role}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
