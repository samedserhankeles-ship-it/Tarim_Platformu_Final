"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Briefcase, Mail, Phone, Globe, Tractor } from "lucide-react";
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
    coverImage: string | null; // Yeni eklendi
    phone: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    role: string;
    createdAt: Date;
    website: string | null;
    addressDetail: string | null;
    // Diğer User alanları gerekirse eklenebilir
}

interface StoreProfileCardProps {
    user: UserProfileData;
    currentUser?: { id: string, name: string | null, email: string } | null; // Sadece gerekli alanlar
    initialIsBlocked?: boolean;
    showActions?: boolean; // Mesaj, Engelle, Şikayet butonlarını göster/gizle
}

export default function StoreProfileCard({ 
    user, 
    currentUser, 
    initialIsBlocked, 
    showActions = true 
}: StoreProfileCardProps) {
    // Check if it's a business profile
    const isBusinessProfile = user.role === "BUSINESS";
    const hasBusinessDetails = isBusinessProfile && (user.website || user.addressDetail || user.phone);

    return (
        <div>
            {/* Banner Area */}
            <div className="relative h-48 rounded-t-2xl overflow-hidden mb-[-48px]">
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
            </div>

            {/* Profil Header */}
            <div className="bg-card rounded-2xl shadow-sm border p-6 md:p-8 mb-8 relative pt-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md translate-y-[-50%] md:translate-y-[-30%] bg-primary/20">
                        <AvatarImage src={user.image || undefined} />
                        <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-center md:text-left space-y-2 mt-[-48px] md:mt-0">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold">{user.name || "İsimsiz Kullanıcı"}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-1">
                                    <Badge variant="secondary" className="capitalize text-base px-3">
                                        {user.role === "ADMIN" ? "Yönetici" : (user.role === "FARMER" ? "Çiftçi" : user.role?.toLowerCase() || "Üye")}
                                    </Badge>
                                    {user.createdAt && (
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Üyelik: {user.createdAt.toLocaleDateString("tr-TR")}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            {showActions && currentUser && currentUser.id !== user.id && (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
                                    <MessageButton 
                                        receiverId={user.id} 
                                        currentUserId={currentUser.id} 
                                        className="w-auto"
                                        size="sm"
                                    />
                                    <BlockButton userId={user.id} initialIsBlocked={!!initialIsBlocked} />
                                    <ReportButton reportedUserId={user.id} isLoggedIn={!!currentUser} variant="outline" />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-muted-foreground mt-4">
                            {(user.city || user.district) && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{user.city}, {user.district}</span>
                                </div>
                            )}
                            {user.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{isBusinessProfile ? user.email : `${user.email.substring(0, 3)}***@***`}</span>
                                </div>
                            )}
                            {isBusinessProfile && user.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-4 w-4" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {isBusinessProfile && user.website && (
                                <Link href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-primary">
                                    <Globe className="h-4 w-4" />
                                    <span>Web Sitesi</span>
                                </Link>
                            )}
                        </div>

                        {user.bio && (
                            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-base text-muted-foreground max-w-2xl text-left leading-relaxed">
                                <h3 className="font-semibold text-foreground mb-2">Hakkımızda</h3>
                                <p>{user.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* İşletme Bilgileri Kartı (Sadece Business profiller için) */}
            {hasBusinessDetails && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            İşletme İletişim Bilgileri
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {user.addressDetail && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="h-5 w-5 mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">Adres:</p>
                                    <p>{user.addressDetail}</p>
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
                        {user.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-5 w-5" />
                                <div>
                                    <p className="font-semibold text-foreground">E-posta:</p>
                                    <Link href={`mailto:${user.email}`} className="hover:underline text-primary">{user.email}</Link>
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
