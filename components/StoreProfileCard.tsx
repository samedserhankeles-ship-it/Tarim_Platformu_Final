"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Briefcase, Mail, Phone, Globe, Tractor, User2, MessageSquare, Ban, Flag, Settings } from "lucide-react"; // Tüm ikonlar
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BlockButton from "@/components/block-button";
import ReportButton from "@/components/report-button";
import MessageButton from "@/components/message-button";

interface UserProfileData {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    coverImage: string | null;
    phone: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    role: string;
    createdAt: Date; // Date objesi olarak kalmalı
    website: string | null;
    addressDetail: string | null;
}

interface StoreProfileCardProps {
    user: UserProfileData;
    currentUser?: { id: string, name: string | null, email: string } | null;
    initialIsBlocked?: boolean;
    showActions?: boolean;
}

export default function StoreProfileCard({ 
    user, 
    currentUser, 
    initialIsBlocked, 
    showActions = true 
}: StoreProfileCardProps) {
    const isBusinessProfile = user.role === "BUSINESS";
    
    // İşletme Bilgileri Kartı için sadece ilgili alanlar doluysa göster
    const hasBusinessDetails = isBusinessProfile && (user.addressDetail || user.phone || user.email || user.website);

    return (
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-sm border bg-card">
            {/* Banner Area (Daha Geniş) */}
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
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div> {/* Metin okunaklılığı için gradient */}
            </div>

            {/* Profil Bilgileri ve Avatar */}
            <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8 pt-0 -mt-24 md:-mt-32 flex flex-col md:flex-row items-center md:items-end gap-6">
                {/* Avatar (Daha Büyük) */}
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
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize text-base px-3 py-1">
                            {user.role === "ADMIN" ? "Yönetici" : (user.role === "FARMER" ? "Çiftçi" : user.role?.toLowerCase() || "Üye")}
                        </Badge>
                        {user.createdAt && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <Calendar className="h-3 w-3" /> Üyelik: {user.createdAt.toLocaleDateString("tr-TR")}
                            </Badge>
                        )}
                        {(user.city || user.district) && (
                            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                                <MapPin className="h-3 w-3" /> {user.city}, {user.district}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Actions Buttons */}
                {showActions && currentUser && currentUser.id !== user.id && (
                    <div className="flex flex-wrap gap-3 justify-center md:justify-end w-full md:w-auto shrink-0 mb-4">
                        <MessageButton 
                            receiverId={user.id} 
                            currentUserId={currentUser.id} 
                            className="w-auto"
                            size="default" // Default boyutta olsun
                            variant="default"
                        >
                            <MessageSquare className="mr-2 h-5 w-5" /> Mesaj Gönder
                        </MessageButton>
                        <BlockButton 
                            userId={user.id} 
                            initialIsBlocked={!!initialIsBlocked} 
                            variant="outline"
                            className="w-auto"
                            size="default"
                        >
                            <Ban className="mr-2 h-5 w-5" /> Engelle
                        </BlockButton>
                        <ReportButton 
                            reportedUserId={user.id} 
                            isLoggedIn={!!currentUser} 
                            variant="outline" 
                            className="w-auto"
                            size="default"
                        >
                            <Flag className="mr-2 h-5 w-5" /> Şikayet Et
                        </ReportButton>
                    </div>
                )}
            </div>

            {/* Hakkımızda / İletişim Bilgileri (Alt Bölüm) */}
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hakkımızda */}
                <div className="md:col-span-2">
                    {user.bio && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User2 className="h-5 w-5 text-primary" /> Hakkımızda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-base text-muted-foreground leading-relaxed">
                                <p>{user.bio}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* İletişim Bilgileri (Sağ Kolon) */}
                {(user.email || user.phone || user.website || user.addressDetail) && (
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" /> İletişim
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-5 w-5" />
                                        <div>
                                            <p className="font-semibold text-foreground">E-posta:</p>
                                            <Link href={`mailto:${user.email}`} className="hover:underline text-primary">{user.email}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-5 w-5" />
                                        <div>
                                            <p className="font-semibold text-foreground">Telefon:</p>
                                            <Link href={`tel:${user.phone}`} className="hover:underline text-primary">{user.phone}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.website && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Globe className="h-5 w-5" />
                                        <div>
                                            <p className="font-semibold text-foreground">Web Sitesi:</p>
                                            <Link href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">{user.website}</Link>
                                        </div>
                                    </div>
                                )}
                                {user.addressDetail && (
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="h-5 w-5 mt-1 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-foreground">Adres:</p>
                                            <p>{user.addressDetail}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}