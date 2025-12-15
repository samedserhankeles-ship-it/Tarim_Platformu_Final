"use client";

import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, addDays, isAfter } from "date-fns";
import { tr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button"; 
import { Search, MoreHorizontal, Ban, Unlock, UserMinus, UserPlus, Trash2, CalendarIcon, Loader2, Megaphone } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { fetchUsersAction } from "@/app/actions/user"; 
import { banUserAction, unbanUserAction, restrictUserAction, unrestrictUserAction, sendPrivateAnnouncementAction } from "@/app/actions/admin"; 
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  city: string | null;
  district: string | null;
  createdAt: Date;
  phone: string | null;
  isBanned: boolean;
  bannedUntil: Date | null;
  banReason: string | null;
  isRestricted: boolean;
  restrictionReason: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [users, setUsers] = useState<UserData[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [openBanDialog, setOpenBanDialog] = useState(false);
  const [openUnbanDialog, setOpenUnbanDialog] = useState(false);
  const [openRestrictDialog, setOpenRestrictDialog] = useState(false);
  const [openUnrestrictDialog, setOpenUnrestrictDialog] = useState(false);
  const [openAnnouncementDialog, setOpenAnnouncementDialog] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState<Date | undefined>(undefined);
  const [restrictionReason, setRestrictionReason] = useState("");
  
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  useEffect(() => {
    startTransition(async () => {
      const fetchedUsers = await fetchUsersAction(searchQuery); 
      setUsers(fetchedUsers);
    });
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery !== initialSearchQuery) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          params.set("q", searchQuery);
        } else {
          params.delete("q");
        }
        router.replace(`?${params.toString()}`);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, router, searchParams, initialSearchQuery]);

  const handleBanUser = async () => {
    if (!selectedUser || !banReason || !banDuration) return;
    const durationInDays = Math.ceil((banDuration.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const result = await banUserAction(selectedUser.id, durationInDays, banReason);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenBanDialog(false);
      setBanReason("");
      setBanDuration(undefined);
      startTransition(async () => { 
        const fetchedUsers = await fetchUsersAction(searchQuery);
        setUsers(fetchedUsers);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedUser) return;
    const result = await unbanUserAction(selectedUser.id);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenUnbanDialog(false);
      startTransition(async () => { 
        const fetchedUsers = await fetchUsersAction(searchQuery);
        setUsers(fetchedUsers);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleRestrictUser = async () => {
    if (!selectedUser || !restrictionReason) return;
    const result = await restrictUserAction(selectedUser.id, restrictionReason);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenRestrictDialog(false);
      setRestrictionReason("");
      startTransition(async () => { 
        const fetchedUsers = await fetchUsersAction(searchQuery);
        setUsers(fetchedUsers);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleUnrestrictUser = async () => {
    if (!selectedUser) return;
    const result = await unrestrictUserAction(selectedUser.id);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenUnrestrictDialog(false);
      startTransition(async () => { 
        const fetchedUsers = await fetchUsersAction(searchQuery);
        setUsers(fetchedUsers);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleSendAnnouncement = async () => {
    if (!selectedUser || !announcementTitle.trim() || !announcementMessage.trim()) return;
    
    const result = await sendPrivateAnnouncementAction(selectedUser.id, announcementTitle, announcementMessage);
    
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenAnnouncementDialog(false);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Kullanıcı Yönetimi</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="Kullanıcı adı veya e-posta ile ara..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistemdeki Kullanıcılar ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex justify-center items-center h-48">
              <p>Kullanıcılar yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Adı Soyadı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Rolü</TableHead>
                      <TableHead>Telefon Numarası</TableHead>
                      <TableHead>Konum</TableHead>
                      <TableHead>Kayıt Tarihi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground">
                                Eşleşen kullanıcı bulunamadı.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell className="capitalize">{user.role === "FARMER" ? "Çiftçi" : user.role}</TableCell>
                            <TableCell>{user.phone || "N/A"}</TableCell>
                            <TableCell>{[user.city, user.district].filter(Boolean).join(", ") || "N/A"}</TableCell>
                            <TableCell>{format(user.createdAt, "dd MMM yyyy", { locale: tr })}</TableCell>
                            <TableCell>
                                {user.isBanned && isAfter(new Date(user.bannedUntil!), new Date()) && (
                                    <Badge variant="destructive" className="mr-1">Yasaklı</Badge>
                                )}
                                {user.isRestricted && <Badge variant="secondary">Kısıtlı</Badge>}
                                {!user.isBanned && !user.isRestricted && <Badge variant="outline">Aktif</Badge>}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Aç</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpenAnnouncementDialog(true); }}>
                                            <Megaphone className="mr-2 h-4 w-4" /> Özel Duyuru Gönder
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {/* Ban/Unban */}
                                        {!user.isBanned || !isAfter(new Date(user.bannedUntil!), new Date()) ? (
                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpenBanDialog(true); }}>
                                                <Ban className="mr-2 h-4 w-4" /> Banla
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpenUnbanDialog(true); }}>
                                                <Unlock className="mr-2 h-4 w-4" /> Banı Kaldır
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        {/* Restrict/Unrestrict */}
                                        {!user.isRestricted ? (
                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpenRestrictDialog(true); }}>
                                                <UserMinus className="mr-2 h-4 w-4" /> Kısıtla
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setOpenUnrestrictDialog(true); }}>
                                                <UserPlus className="mr-2 h-4 w-4" /> Kısıtlamayı Kaldır
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        {user.role !== "ADMIN" && ( 
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => {  }}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Hesabı Sil
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    )}</TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcement Dialog */}
      <Dialog open={openAnnouncementDialog} onOpenChange={setOpenAnnouncementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıya Özel Duyuru: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Bu kullanıcıya bildirim olarak gönderilecek özel duyuruyu girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement-title">Duyuru Başlığı</Label>
              <Input
                id="announcement-title"
                placeholder="Örn: Hesabınız Hakkında"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="announcement-message">Duyuru Mesajı</Label>
              <Textarea
                id="announcement-message"
                placeholder="Mesajınızı buraya yazın..."
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAnnouncementDialog(false)}>İptal</Button>
            <Button onClick={handleSendAnnouncement} disabled={!announcementTitle || !announcementMessage}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Gönder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Dialog */}
      <AlertDialog open={openBanDialog} onOpenChange={setOpenBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Banla: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı neden banlamak istediğinizi ve ban süresini belirtin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Ban Sebebi</Label>
              <Textarea
                id="ban-reason"
                placeholder="Örn: Uygunsuz içerik paylaşımı"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-duration">Ban Süresi (Gün)</Label>
              <Input
                id="ban-duration"
                type="number"
                value={banDuration ? Math.ceil((banDuration.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0}
                onChange={(e) => {
                    const days = parseInt(e.target.value);
                    if (!isNaN(days) && days >= 0) {
                        setBanDuration(addDays(new Date(), days));
                    } else {
                        setBanDuration(undefined);
                    }
                }}
                min={0}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} disabled={!banReason || !banDuration}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Banla"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban User Dialog */}
      <AlertDialog open={openUnbanDialog} onOpenChange={setOpenUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcı Banını Kaldır: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcının yasağını kaldırmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnbanUser}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Banı Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restrict User Dialog */}
      <AlertDialog open={openRestrictDialog} onOpenChange={setOpenRestrictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Kısıtla: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı neden kısıtlamak istediğinizi belirtin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restrict-reason">Kısıtlama Sebebi</Label>
              <Textarea
                id="restrict-reason"
                placeholder="Örn: İlan kurallarına aykırı hareket"
                value={restrictionReason}
                onChange={(e) => setRestrictionReason(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestrictUser} disabled={!restrictionReason}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kısıtla"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unrestrict User Dialog */}
      <AlertDialog open={openUnrestrictDialog} onOpenChange={setOpenUnrestrictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kısıtlamayı Kaldır: {selectedUser?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcının kısıtlamalarını kaldırmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnrestrictUser}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kısıtlamayı Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
