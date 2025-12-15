"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Menu, 
  Search,
  Sprout,
  Bell,
  User,
  FileText,
  MessageSquare,
  Settings,
  LogOut
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

// User tipi tanımı (MasterHeader ile uyumlu olması için)
type UserType = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    unreadNotificationCount?: number;
} | null;

export function Header({ user = null }: { user?: UserType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
        router.push(`/explore`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* LOGO Kaldırıldı */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Logo ve TarımPazar yazısı kullanıcı isteği üzerine kaldırıldı */}
        </div>

        {/* SEARCH BAR (CENTER) */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block">
            <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="İlan, ürün veya hizmet ara..." 
                    className="pl-9 bg-muted/40 border-muted-foreground/20 focus:bg-background transition-colors h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>

        {/* NAVIGATION & ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground mr-2">
                <Link href="/explore" className="hover:text-emerald-600 transition-colors">İlanlar</Link>
                <Link href="/market" className="hover:text-emerald-600 transition-colors">Pazar</Link>
                <Link href="/community" className="hover:text-emerald-600 transition-colors">Topluluk</Link>
            </nav>

            {/* AUTH ACTIONS */}
            {!user ? (
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
                     {/* Bildirimler */}
                     <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-emerald-700">
                        <Bell className="h-5 w-5" />
                        {(user.unreadNotificationCount || 0) > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                                {user.unreadNotificationCount}
                            </span>
                        )}
                     </Button>

                     {/* Ayırıcı Çizgi */}
                     <div className="h-6 w-px bg-gray-200 hidden md:block" />

                     {/* Kullanıcı Dropdown */}
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-3 hover:bg-muted/50 p-1.5 rounded-lg transition-colors outline-none">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold leading-none text-gray-700">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.role}</p>
                                </div>
                                <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                    <AvatarImage src={user.image || undefined} alt={user.name || "U"} />
                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                                        {(user.name || "U").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.role} • {user.email}
                            </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profil" className="cursor-pointer flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profilim</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/ilanlarim" className="cursor-pointer flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                <span>İlanlarım</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/mesajlar" className="cursor-pointer flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                <span>Mesajlar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings" className="cursor-pointer flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Ayarlar</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={async () => {
                                await logoutAction();
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Çıkış Yap</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* MOBILE MENU TRIGGER */}
            <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
            </Button>

        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Ara..." 
                className="pl-9 bg-muted/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </form>
      </div>
    </header>
  );
}