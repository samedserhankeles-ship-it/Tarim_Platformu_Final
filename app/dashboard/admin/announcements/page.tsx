"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Megaphone, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

import { createAnnouncementAction } from "@/app/actions/admin"; // Admin action to create announcements
import { fetchAnnouncementsAction } from "@/app/actions/announcement"; // Import the server action


export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  // const initialSearchQuery = ""; // Not directly used in URL search params for this page yet

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");
  const [newAnnouncementTargetRoles, setNewAnnouncementTargetRoles] = useState("");


  // Fetch announcements on mount and search query changes
  useEffect(() => {
    const fetchAndSetAnnouncements = async () => {
      startTransition(async () => {
        const fetchedAnnouncements = await fetchAnnouncementsAction(searchQuery);
        setAnnouncements(fetchedAnnouncements);
      });
    };
    fetchAndSetAnnouncements();
  }, [searchQuery]); // Re-fetch when searchQuery changes


  const handleCreateAnnouncement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
      toast({ title: "Hata", description: "Başlık ve içerik boş olamaz.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await createAnnouncementAction(newAnnouncementTitle, newAnnouncementContent, newAnnouncementTargetRoles);
      if (result.success) {
        toast({ title: "Başarılı", description: result.message });
        setNewAnnouncementTitle("");
        setNewAnnouncementContent("");
        setNewAnnouncementTargetRoles("");
        // Re-fetch announcements to update list
        const fetchedAnnouncements = await fetchAnnouncementsAction(searchQuery);
        setAnnouncements(fetchedAnnouncements);
      } else {
        toast({ title: "Hata", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Duyuru Yönetimi</h1>
      
      {/* Duyuru Oluşturma Formu */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Yeni Duyuru Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Başlık</Label>
              <Input
                id="announcement-title"
                value={newAnnouncementTitle}
                onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                placeholder="Duyuru Başlığı"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-content">İçerik</Label>
              <Textarea
                id="announcement-content"
                value={newAnnouncementContent}
                onChange={(e) => setNewAnnouncementContent(e.target.value)}
                placeholder="Duyuru içeriğini buraya yazın..."
                rows={5}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-roles">Hedef Roller (İsteğe Bağlı, Virgülle Ayırın)</Label>
              <Input
                id="announcement-roles"
                value={newAnnouncementTargetRoles}
                onChange={(e) => setNewAnnouncementTargetRoles(e.target.value)}
                placeholder="Örn: FARMER,BUSINESS"
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
              Duyuru Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mevcut Duyurular Listesi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Mevcut Duyurular ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Duyuru başlığı veya içeriği ile ara..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isPending}
            />
          </div>

          {announcements.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Henüz oluşturulmuş duyuru bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlık</TableHead>
                    <TableHead>İçerik</TableHead>
                    <TableHead>Hedef Kitle</TableHead>
                    <TableHead>Yazar</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Aksiyonlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{announcement.content}</TableCell>
                      <TableCell>{announcement.targetRoles || "Tüm Roller"}</TableCell>
                      <TableCell>{announcement.author?.name || "Bilinmiyor"}</TableCell>
                      <TableCell>{format(announcement.createdAt, "dd MMM yyyy HH:mm", { locale: tr })}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled={isPending}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
