"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Trash2, Loader2, EyeOff, Eye } from "lucide-react"; // Import EyeOff, Eye
import { useEffect, useState, useTransition } from "react";
import { deleteListingAction, toggleListingActiveStatusAction } from "@/app/actions/admin"; // Import toggleListingActiveStatusAction
import { fetchAllListingsAction } from "@/app/actions/listing"; // Import the server action
import { useToast } from "@/hooks/use-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Badge } from "@/components/ui/badge";


interface ListingData {
  id: string;
  type: "product" | "job";
  title: string;
  description: string;
  user: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
  active: boolean;
}

export default function AdminListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearchQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openToggleStatusDialog, setOpenToggleStatusDialog] = useState(false); // New state for toggle status dialog

  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null);

  // Fetch listings on mount and search query changes
  useEffect(() => {
    startTransition(async () => {
      const fetchedListings = await fetchAllListingsAction(searchQuery);
      setListings(fetchedListings);
    });
  }, [searchQuery]);

  // Debounce effect for search input
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


  const handleDeleteListing = async () => {
    if (!selectedListing) return;
    const result = await deleteListingAction(selectedListing.id, selectedListing.type);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenDeleteDialog(false);
      startTransition(async () => { // Re-fetch listings to update table
        const fetchedListings = await fetchAllListingsAction(searchQuery);
        setListings(fetchedListings);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleToggleListingStatus = async () => {
    if (!selectedListing) return;
    const newStatus = !selectedListing.active;
    const result = await toggleListingActiveStatusAction(selectedListing.id, selectedListing.type, newStatus);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenToggleStatusDialog(false);
      startTransition(async () => { // Re-fetch listings to update table
        const fetchedListings = await fetchAllListingsAction(searchQuery);
        setListings(fetchedListings);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">İlan Yönetimi</h1>
      
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="text"
          placeholder="İlan başlığı, açıklaması veya ilan sahibi ile ara..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sistemdeki İlanlar ({listings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex justify-center items-center h-48">
              <p>İlanlar yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Türü</TableHead>
                      <TableHead>İlan Sahibi</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma Tarihi</TableHead>
                      <TableHead>Aksiyonlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">
                                Eşleşen ilan bulunamadı.
                            </TableCell>
                        </TableRow>
                    ) : (
                        listings.map((listing) => (
                        <TableRow key={listing.id}>
                            <TableCell className="font-medium">{listing.title}</TableCell>
                            <TableCell className="capitalize">{listing.type === "product" ? "Ürün" : "İş"}</TableCell>
                            <TableCell>{listing.user.name || listing.user.email}</TableCell>
                            <TableCell>
                                {listing.active ? (
                                    <Badge variant="default">Aktif</Badge>
                                ) : (
                                    <Badge variant="destructive">Pasif</Badge>
                                )}
                            </TableCell>
                            <TableCell>{format(listing.createdAt, "dd MMM yyyy HH:mm", { locale: tr })}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Aç</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(`/ilan/${listing.type.substring(0,4)}-${listing.id}`)}>
                                            Görüntüle
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setSelectedListing(listing); setOpenToggleStatusDialog(true); }}>
                                            {listing.active ? (
                                                <> <EyeOff className="mr-2 h-4 w-4" /> Gizle </>
                                            ) : (
                                                <> <Eye className="mr-2 h-4 w-4" /> Yayınla </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => { setSelectedListing(listing); setOpenDeleteDialog(true); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Listing Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İlanı Sil: {selectedListing?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ilanı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteListing} className="bg-red-600 hover:bg-red-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "İlanı Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle Listing Status Dialog */}
      <AlertDialog open={openToggleStatusDialog} onOpenChange={setOpenToggleStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedListing?.active ? "İlanı Gizle" : "İlanı Yayınla"}: {selectedListing?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ilanın görünürlük durumunu değiştirmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleListingStatus} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (selectedListing?.active ? "Gizle" : "Yayınla")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
