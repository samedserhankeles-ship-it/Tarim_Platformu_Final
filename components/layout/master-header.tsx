"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Menu, Search, Sprout, Bell, User, FileText, 
  MessageSquare, Settings, LogOut, LayoutDashboard, Heart, ShoppingBag 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/app/actions/auth";
import { getRoleLabel } from "@/lib/roles";

type UserType = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    unreadNotificationCount?: number;
    latestNotifications?: any[]; // Bildirim listesi eklendi
} | null;

export function MasterHeader({ user }: { user: UserType }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");

  // LİNKLERİ AYARLA
  const guestLinks = [
    { label: "Market", href: "/explore", icon: ShoppingBag },
    { label: "Topluluk", href: "/community", icon: User },
  ];

  const userLinks = [
    { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
    { label: "Market", href: "/explore", icon: ShoppingBag },
    { label: "Mesajlar", href: "/dashboard/mesajlar", icon: MessageSquare },
  ];

  const isHomepage = pathname === "/";
  // const isDashboard = pathname?.startsWith("/dashboard"); // Artık MasterHeader Dashboard'da da görünecek
  const isAuthPage = pathname?.startsWith("/auth");

  // Dashboard sayfalarında header'ı gizleme kontrolü kaldırıldı.
  // if (isDashboard) {
  //   return null;
  // }

  // Auth sayfalarında VEYA Ana Sayfada kullanıcıyı null gibi kabul et (Böylece Giriş Yap/Kayıt Ol butonları görünür)
  const displayUser = (isAuthPage || isHomepage) ? null : user;

  const activeLinks = displayUser ? userLinks : guestLinks;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full h-16 flex items-center justify-between gap-2 md:gap-4 px-2 md:px-0">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 shrink-0 pl-2 md:pl-4">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-xl text-emerald-700 hover:opacity-90 transition-opacity">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Sprout className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="hidden md:inline">Tarım<span className="text-foreground">Pazar</span></span>
          </Link>
        </div>

        {/* SEARCH BAR */}
        {!isHomepage && (
        <div className="flex-1 max-w-md mx-auto hidden md:block px-4">
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Ara..." 
                    className="pl-9 bg-muted/40 border-muted-foreground/20 focus:bg-background transition-colors h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>
        )}

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-1 md:gap-4 shrink-0 pr-2 md:pr-4 ml-auto">
            
            {/* DYNAMIC NAV (Desktop) */}
            {!isHomepage && (
            <nav className="hidden md:flex items-center gap-1 mr-2">
                {activeLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Button 
                            variant={pathname === link.href ? "secondary" : "ghost"} 
                            className={`text-sm font-medium ${pathname === link.href ? 'bg-emerald-50 text-emerald-700' : 'text-muted-foreground'}`}
                        >
                            {/* @ts-ignore */}
                            {link.icon && <link.icon className="w-4 h-4 mr-2" />} 
                            {link.label}
                        </Button>
                    </Link>
                ))}
            </nav>
            )}

            {/* AUTH ACTIONS */}
            {!displayUser ? (
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                        <Link href="/auth/sign-in">Giriş Yap</Link>
                    </Button>
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Link href="/auth/sign-up">Kayıt Ol</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                     {/* Favoriler Butonu */}
                     <Button asChild variant="ghost" size="icon" className="relative text-muted-foreground hover:text-red-500">
                        <Link href="/dashboard/favoriler">
                            <Heart className="h-5 w-5" />
                        </Link>
                     </Button>

                     {/* Bildirimler */}
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-emerald-700">
                                <Bell className="h-5 w-5" />
                                {(displayUser.unreadNotificationCount || 0) > 0 && (
                                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                                        {displayUser.unreadNotificationCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 overflow-x-hidden">
                            <DropdownMenuLabel>Son Bildirimler</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {displayUser.latestNotifications && displayUser.latestNotifications.length > 0 ? (
                                displayUser.latestNotifications.map((notification) => (
                                    <DropdownMenuItem key={notification.id} asChild>
                                        <Link href={notification.link || "/dashboard/bildirimler"} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                                            <div className="flex items-center justify-between w-full">
                                                <span className={`font-medium text-sm ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {notification.title}
                                                </span>
                                                {!notification.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </Link>
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    Henüz bildiriminiz yok.
                                </div>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/bildirimler" className="w-full text-center cursor-pointer text-emerald-600 font-medium">
                                    Tümünü Gör
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>

                     {/* Kullanıcı Dropdown */}
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 hover:bg-muted/50 p-1.5 rounded-lg transition-colors outline-none" suppressHydrationWarning>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                    <AvatarImage src={displayUser.image || undefined} alt={displayUser.name || "User"} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                        {(displayUser.name || "U").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden lg:block">
                                    <p className="text-sm font-semibold leading-none text-gray-700">{displayUser.name || "Kullanıcı"}</p>
                                    <p className="text-xs text-muted-foreground">{getRoleLabel(displayUser.role)}</p>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/profil/${displayUser.id}`} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" /> Profilim
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="cursor-pointer">
                                    <LayoutDashboard className="mr-2 h-4 w-4" /> Panel
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/profil" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" /> Profil Ayarları
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={async () => {
                                    await logoutAction();
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                </div>
            )}


        </div>
      </div>
    </header>
  );
}
