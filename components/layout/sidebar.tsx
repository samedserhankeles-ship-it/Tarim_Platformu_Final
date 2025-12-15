"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, MessageSquare, Settings, LogOut, BarChart3, ShoppingBag, Users, Flag, FileStack, Megaphone, Mail, Sprout, Home } from "lucide-react"; // Import Mail
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Genel Bakış", href: "/dashboard" },
  { icon: ShoppingBag, label: "Market", href: "/explore" },
  { icon: FileText, label: "İlanlarım", href: "/dashboard/ilanlarim" },
  { icon: MessageSquare, label: "Mesajlar", href: "/dashboard/mesajlar" },
  { icon: BarChart3, label: "Raporlar", href: "/dashboard/raporlar" },
  { icon: Settings, label: "Ayarlar", href: "/dashboard/ayarlar" },
];

type UserType = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    image: string | null;
    unreadNotificationCount?: number;
} | null;

// Sidebar içeriği (hem desktop hem mobil için)
function SidebarContent({ user, pathname, isMobile }: { user: UserType; pathname: string; isMobile?: boolean }) {
  const dynamicSidebarItems = [...sidebarItems]; // Create a mutable copy

  // Conditionally add Admin links
  if (user && user.role === "ADMIN") {
    const settingsIndex = dynamicSidebarItems.findIndex(item => item.label === "Ayarlar");
    const reportsItem = {
        icon: Flag,
        label: "Kullanıcı Şikayetleri",
        href: "/dashboard/reports",
    };
    const userQueryItem = {
        icon: Users,
        label: "Kullanıcı Sorgu",
        href: "/dashboard/users",
    };
    const listingsAdminItem = {
        icon: FileStack,
        label: "İlan Yönetimi",
        href: "/dashboard/admin/listings",
    };
    const announcementsAdminItem = {
        icon: Megaphone,
        label: "Duyurular",
        href: "/dashboard/admin/announcements",
    };
    const bulkMessagesAdminItem = {
        icon: Mail,
        label: "Toplu Mesaj Gönder",
        href: "/dashboard/admin/bulk-messages",
    };


    if (settingsIndex !== -1) {
        // Insert in reverse order to maintain correct final positions with splice
        dynamicSidebarItems.splice(settingsIndex, 0, reportsItem);
        dynamicSidebarItems.splice(settingsIndex, 0, userQueryItem);
        dynamicSidebarItems.splice(settingsIndex, 0, bulkMessagesAdminItem); // New item
        dynamicSidebarItems.splice(settingsIndex, 0, announcementsAdminItem);
        dynamicSidebarItems.splice(settingsIndex, 0, listingsAdminItem);
    } else {
        // Fallback: if "Ayarlar" is not found, just push to the end
        dynamicSidebarItems.push(listingsAdminItem);
        dynamicSidebarItems.push(announcementsAdminItem);
        dynamicSidebarItems.push(bulkMessagesAdminItem); // New item
        dynamicSidebarItems.push(userQueryItem);
        dynamicSidebarItems.push(reportsItem);
    }
  }

  return (
    <nav className="flex flex-col space-y-1 p-4">
      {/* Ana Sayfa Butonu (Kullanıcı isteği üzerine kaldırıldı) */}
      {dynamicSidebarItems.map((item) => {
        const isActive = pathname === item.href;
        const linkContent = (
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={`w-full justify-start ${isActive ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground"}`}
          >
            {/* @ts-ignore */}
            {item.icon && <item.icon className="mr-2 h-4 w-4" />} 
            {item.label}
          </Button>
        );
        
        if (isMobile) {
          return (
            <SheetClose key={item.href} asChild>
              <Link href={item.href}>
                {linkContent}
              </Link>
            </SheetClose>
          );
        }
        
        return (
          <Link key={item.href} href={item.href}>
            {linkContent}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ user }: { user: UserType }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col min-h-screen shrink-0">
        {/* Logo / Ana Sayfa Linki kaldırıldı */}
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-[100] bg-white shadow-lg border h-10 w-10">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 sm:w-64">
          <SheetTitle className="sr-only">Menü</SheetTitle>
          {/* Logo / Ana Sayfa Linki kaldırıldı */}
          {/* Ana Sayfa Butonu (Kullanıcı isteği üzerine kaldırıldı) */}
          <SidebarContent user={user} pathname={pathname} isMobile={true} />
        </SheetContent>
      </Sheet>
    </>
  );
}
