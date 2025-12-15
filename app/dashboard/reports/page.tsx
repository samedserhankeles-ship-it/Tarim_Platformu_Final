"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Flag, MoreHorizontal, Trash2, Loader2, Eye, ExternalLink, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { deleteReportAction } from "@/app/actions/admin";
import { fetchReportsAction } from "@/app/actions/reports";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AdminReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [reports, setReports] = useState<any[]>([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const fetchedReports = await fetchReportsAction();
      setReports(fetchedReports);
    });
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "PENDING": return "secondary";
      case "RESOLVED": return "default";
      case "DISMISSED": return "destructive";
      default: return "secondary";
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    const result = await deleteReportAction(selectedReport.id);
    if (result.success) {
      toast({ title: "Başarılı", description: result.message });
      setOpenDeleteDialog(false);
      startTransition(async () => {
        const fetchedReports = await fetchReportsAction();
        setReports(fetchedReports);
      });
    } else {
      toast({ title: "Hata", description: result.message, variant: "destructive" });
    }
  };

  const handleGoToMarketPage = () => { // Market sayfasına giden fonksiyon
    if (selectedReport) {
      const listingType = selectedReport.product ? "prod" : (selectedReport.jobPosting ? "job" : "");
      if (listingType === "prod") {
        router.push(`/market`); // Ürün ise market sayfasına
      } else if (listingType === "job") {
        router.push(`/explore`); // İş ilanı ise explore sayfasına
      } else {
        router.push(`/explore`); // İlan tipi belirli değilse genel explore sayfasına
      }
      setOpenViewDialog(false); // Detay penceresini kapat
    }
  };

  const handleGoToListingDetails = () => { // İlan detayına giden fonksiyon
    if (selectedReport) {
      const listingType = selectedReport.product ? "prod" : (selectedReport.jobPosting ? "job" : "");
      const listingId = selectedReport.productId || selectedReport.jobPostingId;
      if (listingType && listingId) {
        window.open(`/ilan/${listingType}-${listingId}`, '_blank');
      }
    }
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Kullanıcı Şikayetleri Yönetimi</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Sistemdeki Şikayetler ({reports.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Flag className="h-12 w-12 mb-4 opacity-20" />
              <p>Henüz sistemde kayıtlı şikayet bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şikayet Eden</TableHead>
                    <TableHead>Şikayet Edilen</TableHead>
                    <TableHead>İlan</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Aksiyonlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const reportedListing = report.product || report.jobPosting;
                    const listingType = report.product ? "prod" : (report.jobPosting ? "job" : "");
                    const listingId = report.productId || report.jobPostingId;

                    return (
                        <TableRow key={report.id}>
                            <TableCell className="font-medium">
                                {report.reporter?.name || report.reporter?.email || "Bilinmiyor"}
                            </TableCell>
                            <TableCell className="font-medium">
                                {report.reported?.name || report.reported?.email || "Bilinmiyor"}
                            </TableCell>
                            <TableCell>
                                {reportedListing ? (
                                    <Link href={`/ilan/${listingType}-${listingId}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                        <FileText className="h-4 w-4" /> {reportedListing.title}
                                    </Link>
                                ) : (
                                    "N/A"
                                )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{report.reason}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(report.status)} className="capitalize">
                                    {report.status === "PENDING" ? "Beklemede" : report.status === "RESOLVED" ? "Çözüldü" : "Reddedildi"}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(report.createdAt, "dd MMM yyyy HH:mm", { locale: tr })}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Aç</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => { setSelectedReport(report); setOpenViewDialog(true); }}>
                                            <Eye className="mr-2 h-4 w-4" /> Şikayeti Görüntüle
                                        </DropdownMenuItem>
                                        {reportedListing && ( // İlana git aksiyonu
                                            <DropdownMenuItem onClick={handleGoToListingDetails}>
                                                <ExternalLink className="mr-2 h-4 w-4" /> İlan Detayına Git
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => { setSelectedReport(report); setOpenDeleteDialog(true); }}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Report Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şikayeti Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu şikayeti kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-red-600 hover:bg-red-700 text-white">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Şikayeti Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Report Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Şikayet Detayları</DialogTitle>
            <DialogDescription>
                Şikayetin tüm detayları aşağıdadır.
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6 py-4">
               {/* Şikayet Nedeni */}
               <div className="space-y-2">
                 <h4 className="text-sm font-medium text-muted-foreground">Şikayet Nedeni</h4>
                 <div className="p-3 bg-muted/50 rounded-lg text-sm border">
                    {selectedReport.reason}
                 </div>
               </div>

               {/* Taraflar */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <h4 className="text-sm font-medium text-muted-foreground">Şikayet Eden</h4>
                     <p className="font-medium text-sm">{selectedReport.reporter?.name || "İsimsiz"}</p>
                     <p className="text-xs text-muted-foreground">{selectedReport.reporter?.email}</p>
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-sm font-medium text-muted-foreground">Şikayet Edilen</h4>
                     <p className="font-medium text-sm">{selectedReport.reported?.name || "İsimsiz"}</p>
                     <p className="text-xs text-muted-foreground">{selectedReport.reported?.email}</p>
                  </div>
               </div>

               {/* İlan Detayı */}
               {(selectedReport.product || selectedReport.jobPosting) && (
                   <div className="space-y-2 pt-2 border-t">
                      <h4 className="text-sm font-medium text-muted-foreground">İlgili İlan</h4>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                          <span className="text-sm font-medium truncate max-w-[200px]">
                              {selectedReport.product?.title || selectedReport.jobPosting?.title}
                          </span>
                          <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs"
                                onClick={handleGoToListingDetails}
                            >
                                <ExternalLink className="mr-2 h-3 w-3" /> İlan Detayına Git
                            </Button>
                      </div>
                   </div>
               )}

               {/* Meta Bilgiler */}
               <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                   <span>ID: {selectedReport.id}</span>
                   <span>{format(selectedReport.createdAt, "d MMMM yyyy HH:mm", { locale: tr })}</span>
               </div>
            </div>
          )}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 space-y-2"> {/* Butonları sağa hizala ve sırayı ters çevir */}
             {(selectedReport?.product || selectedReport?.jobPosting) && (
                <Button variant="secondary" onClick={handleGoToListingDetails}>
                   <ExternalLink className="mr-2 h-4 w-4" /> İlana Git
                </Button>
             )}
             {(selectedReport?.product || selectedReport?.jobPosting) && (
                <Button variant="secondary" onClick={handleGoToMarketPage}>
                   <ShoppingBag className="mr-2 h-4 w-4" /> Market Sayfası
                </Button>
             )}
             <Button onClick={() => setOpenViewDialog(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}