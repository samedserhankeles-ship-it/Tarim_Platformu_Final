"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, MapPin, ArrowRightLeft, Briefcase, Plus, Folder, MoreVertical, Trash2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { createFavoriteGroupAction, deleteFavoriteGroupAction, moveFavoriteToGroupAction } from "@/app/actions/favorite";
import { toast } from "sonner";

type FavoriteItem = {
    id: string; // Favori tablosundaki ID
    groupId: string | null;
    title: string;
    price: string;
    location: string;
    type: string;
    image: string;
    category: string;
    isBarter: boolean;
    userName: string;
    // Link için product id lazım, onu id'den parse ederiz (prod-ID)
    linkId?: string; 
};

type Group = {
    id: string;
    name: string;
};

export default function FavoritesClient({ favorites, groups }: { favorites: any[], groups: Group[] }) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null); // null = "Tümü"
  const [isPending, startTransition] = useTransition();
  const [newGroupName, setNewGroupName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filtreleme
  const filteredFavorites = activeGroupId 
    ? favorites.filter(f => f.groupId === activeGroupId)
    : favorites;

  // Grup Oluşturma
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    startTransition(async () => {
        const res = await createFavoriteGroupAction(newGroupName);
        if (res.success) {
            toast.success(res.message);
            setNewGroupName("");
            setIsDialogOpen(false);
        } else {
            toast.error(res.message);
        }
    });
  };

  // Grup Silme
  const handleDeleteGroup = (groupId: string) => {
    if (!confirm("Grubu silmek istediğinize emin misiniz? İlanlar silinmez, 'Tümü'ne taşınır.")) return;
    startTransition(async () => {
        const res = await deleteFavoriteGroupAction(groupId);
        if (res.success) {
            toast.success(res.message);
            if (activeGroupId === groupId) setActiveGroupId(null);
        } else {
            toast.error(res.message);
        }
    });
  };

  // Gruba Taşıma
  const handleMoveToGroup = (favoriteId: string, groupId: string | "null") => {
    startTransition(async () => {
        const res = await moveFavoriteToGroupAction(favoriteId, groupId);
        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.message);
        }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      <div className="container mx-auto py-8 px-4">
        
        {/* Başlık ve Grup Ekle Butonu */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                    <Heart className="h-6 w-6 text-red-600 fill-current" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Favorilerim</h1>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Grup Oluştur
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yeni Grup Oluştur</DialogTitle>
                        <DialogDescription>Favorilerinizi düzenlemek için bir grup adı girin.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input 
                            placeholder="Örn: Traktörler, Tohumlar..." 
                            value={newGroupName} 
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateGroup} disabled={isPending}>
                            {isPending ? "Oluşturuluyor..." : "Oluştur"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        {/* Gruplar (Tabs) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            <Button 
                variant={activeGroupId === null ? "default" : "outline"}
                onClick={() => setActiveGroupId(null)}
                className="rounded-full"
            >
                Tümü
            </Button>
            {groups.map(group => (
                <div key={group.id} className="relative group">
                    <Button 
                        variant={activeGroupId === group.id ? "default" : "outline"}
                        onClick={() => setActiveGroupId(group.id)}
                        className="rounded-full pr-8" // Silme butonu için yer
                    >
                        <Folder className="mr-2 h-4 w-4" />
                        {group.name}
                    </Button>
                    {/* Grup Silme Butonu (Sadece hover'da veya aktifken görünür yapılabilir, şimdilik basit tutalım) */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-100 rounded-full text-muted-foreground hover:text-red-600 transition-colors"
                        title="Grubu Sil"
                    >
                        <Trash2 className="h-3 w-3" />
                    </button>
                </div>
            ))}
        </div>

        {/* İlan Listesi */}
        {filteredFavorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-background rounded-xl border border-dashed text-center">
                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Bu grupta ilan yok</h3>
                <p className="text-muted-foreground mb-4">
                    {activeGroupId ? "Bu gruba henüz bir ilan taşımadınız." : "Henüz favorilere eklediğiniz bir ilan yok."}
                </p>
                {!activeGroupId && (
                    <Button asChild variant="outline">
                        <Link href="/explore">İlanları Keşfet</Link>
                    </Button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((item) => (
                <Card key={item.id} className={`overflow-hidden hover:shadow-md transition-all group relative ${item.isBarter ? 'border-purple-200' : ''}`}>
                    
                    {/* Gruba Taşı Menüsü (Sağ Üst) */}
                    <div className="absolute top-2 right-2 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Gruba Taşı</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleMoveToGroup(item.id, "null")}>
                                    Genel (Grup Yok)
                                </DropdownMenuItem>
                                {groups.map(g => (
                                    <DropdownMenuItem key={g.id} onClick={() => handleMoveToGroup(item.id, g.id)}>
                                        {g.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="aspect-video w-full overflow-hidden bg-muted relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={item.image} 
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-background/80 text-foreground backdrop-blur-sm">
                                {item.type}
                            </Badge>
                        </div>
                    </div>
                    
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                            <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.category}</p>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-0 flex-1">
                        <div className="flex flex-col gap-2">
                            <p className={`text-lg font-bold ${item.isBarter ? 'text-purple-700' : 'text-primary'}`}>
                                {item.price}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-1" />
                            {item.location}
                            </div>
                        </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 mt-auto border-t bg-muted/10 flex justify-between items-center text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" /> {item.userName}
                        </span>
                        <Link href={`/ilan/${item.id.replace("prod-", "").replace("job-", "")}`}>
                            <Button size="sm" className="h-8" variant="outline">
                                İncele
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
