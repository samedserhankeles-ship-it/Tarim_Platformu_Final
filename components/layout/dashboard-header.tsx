"use client";
import { Bell, Search, LogOut, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CURRENT_USER } from "@/lib/mock-data";
import Link from "next/link";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700 hover:opacity-90 transition-opacity">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Sprout className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="hidden md:inline">Tarım<span className="text-foreground">Pazar</span></span>
          </Link>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-sm md:w-96">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Panelde ara..." className="pl-9 bg-muted/50 border-none focus:bg-white transition-colors" />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Bildirim İkonu ve Badge */}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {CURRENT_USER.notifications > 0 && (
             <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white">
                {CURRENT_USER.notifications}
             </span>
          )}
        </Button>

        {/* Ayırıcı Çizgi */}
        <div className="h-6 w-px bg-gray-200 hidden md:block" />

        {/* Kullanıcı Profili */}
        <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-1.5 rounded-full md:rounded-lg transition-colors">
            <div className="text-right hidden md:block">
                <p className="text-sm font-semibold leading-none text-gray-700">{CURRENT_USER.name}</p>
                <p className="text-xs text-muted-foreground">{CURRENT_USER.role}</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm ring-1 ring-gray-100">
                <AvatarImage src={CURRENT_USER.image} />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {CURRENT_USER.name.substring(0,2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        </div>

        {/* Çıkış Butonu (Yeni) */}
         <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 ml-1 hidden md:flex">
            <LogOut className="h-4 w-4" />
            <span>Çıkış</span>
        </Button>

      </div>
    </header>
  );
}