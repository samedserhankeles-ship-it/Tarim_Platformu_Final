"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Flag, MoreHorizontal, Trash2, Loader2, Eye, ExternalLink, FileText, ShoppingBag, MessageSquareText, User, Share2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ReportTable Component (Outside of AdminReportsPage)
const ReportTable = ({ 
    data, 
    type, 
    onView, 
    onDelete 
}: { 
    data: any[], 
    type: "listing" | "social" | "forum" | "profile",
    onView: (report: any) => void,
    onDelete: (report: any) => void
}) => (
    <div className="overflow-x-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Şikayet Eden</TableHead>
            <TableHead>Şikayet Edilen</TableHead>
            <TableHead>
                {type === "listing" ? "İlan Başlığı" : 
                 type === "social" ? "Gönderi Özeti" : 
                 type === "forum" ? "Konu/Yorum" : "Profil Tipi"}
            </TableHead>
            <TableHead>Sebep</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead>Aksiyonlar</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Bu kategoride şikayet bulunmuyor.
                    </TableCell>
                </TableRow>
            ) : (
                data.map((report) => {
                    let contentInfo = "N/A";
                    let contentLink = "#";

                    if (type === "listing") {
                        const listing = report.product || report.jobPosting;
                        contentInfo = listing?.title || "Silinmiş İlan";
                        const listingType = report.product ? "prod" : "job";
                        contentLink = `/ilan/${listingType}-${report.productId || report.jobPostingId}`;
                    } else if (type === "social") {
                        contentInfo = report.socialPost?.content?.substring(0, 30) + "..." || "Medya İçeriği";
                        contentLink = `/social/${report.socialPostId}`;
                    } else if (type === "forum") {
                        contentInfo = report.forumTopic?.title || report.forumPost?.content?.substring(0, 30) + "...";
                        contentLink = `/community/topic/${report.forumTopicId || report.forumPost?.topicId}`;
                    } else {
                        contentInfo = report.reported?.role || "Kullanıcı";
                        contentLink = `/profil/${report.reportedId}`;
                    }

                    return (
                        <TableRow key={report.id}>
                            <TableCell className="font-medium">
                                {report.reporter?.name || "Bilinmiyor"}
                            </TableCell>
                            <TableCell className="font-medium">
                                {report.reported?.name || "Bilinmiyor"}
                            </TableCell>
                            <TableCell>
                                <Link href={contentLink} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                    <ExternalLink className="h-3 w-3" /> {contentInfo}
                                </Link>
                            </TableCell>
                            <TableCell className="max-w-xs truncate" title={report.reason}>{report.reason}</TableCell>
                            <TableCell>
                                <Badge variant={report.status === "PENDING" ? "secondary" : report.status === "RESOLVED" ? "default" : "destructive"} className="capitalize">
                                    {report.status === "PENDING" ? "Beklemede" : report.status === "RESOLVED" ? "Çözüldü" : "Reddedildi"}
                                </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Aç</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onView(report)}>
                                            <Eye className="mr-2 h-4 w-4" /> İncele
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(report)}>
                                            <Trash2 className="mr-2 h-4 w-4" /> Sil
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })
            )}
        </TableBody>
        </Table>
    </div>
);

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

  const openView = (report: any) => {
      setSelectedReport(report);
      setOpenViewDialog(true);
  };

  const openDelete = (report: any) => {
      setSelectedReport(report);
      setOpenDeleteDialog(true);
  };

  const handleGoToMarketPage = () => {
    if (selectedReport) {
      const listingType = selectedReport.product ? "prod" : (selectedReport.jobPosting ? "job" : "");
      if (listingType === "prod") {
        router.push(`/market`);
      } else if (listingType === "job") {
        router.push(`/explore`);
      } else {
        router.push(`/explore`);
      }
      setOpenViewDialog(false);
    }
  };

  const handleGoToListingDetails = () => {
    if (selectedReport) {
      const listingType = selectedReport.product ? "prod" : (selectedReport.jobPosting ? "job" : "");
      const listingId = selectedReport.productId || selectedReport.jobPostingId;
      if (listingType && listingId) {
        window.open(`/ilan/${listingType}-${listingId}`, '_blank');
      }
    }
  };

  const listingReports = reports.filter(r => r.productId || r.jobPostingId);
  const socialReports = reports.filter(r => r.socialPostId);
  const forumReports = reports.filter(r => r.forumTopicId || r.forumPostId);
  const profileReports = reports.filter(r => !r.productId && !r.jobPostingId && !r.socialPostId && !r.forumTopicId && !r.forumPostId);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Kullanıcı Şikayetleri Yönetimi</h1>
      
      <Tabs defaultValue="listings" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="listings" className="gap-2">
                <FileText className="h-4 w-4" /> İlanlar
                <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-[1.25rem]">{listingReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
                <Share2 className="h-4 w-4" /> Sosyal
                <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-[1.25rem]">{socialReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="forum" className="gap-2">
                <MessageSquareText className="h-4 w-4" /> Forum
                <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-[1.25rem]">{forumReports.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" /> Profil
                <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 min-w-[1.25rem]">{profileReports.length}</Badge>
            </TabsTrigger>
        </TabsList>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Flag className="h-5 w-5 text-primary" />
                    Şikayet Listesi
                </CardTitle>
            </CardHeader>
            <CardContent>
                <TabsContent value="listings" className="mt-0">
                    <ReportTable data={listingReports} type="listing" onView={openView} onDelete={openDelete} />
                </TabsContent>
                <TabsContent value="social" className="mt-0">
                    <ReportTable data={socialReports} type="social" onView={openView} onDelete={openDelete} />
                </TabsContent>
                <TabsContent value="forum" className="mt-0">
                    <ReportTable data={forumReports} type="forum" onView={openView} onDelete={openDelete} />
                </TabsContent>
                <TabsContent value="profile" className="mt-0">
                    <ReportTable data={profileReports} type="profile" onView={openView} onDelete={openDelete} />
                </TabsContent>
            </CardContent>
        </Card>
      </Tabs>

      {/* Delete Report Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Şikayeti Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu şikayet kaydını silmek istediğinize emin misiniz? (İçerik silinmez, sadece şikayet kaydı silinir)
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
            <DialogDescription>ID: {selectedReport?.id}</DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
                <div className="p-3 bg-muted rounded-md text-sm border">
                    <span className="font-semibold block mb-1">Şikayet Nedeni:</span>
                    {selectedReport.reason}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-semibold text-muted-foreground">Şikayet Eden:</span>
                        <p>{selectedReport.reporter?.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedReport.reporter?.email}</p>
                    </div>
                    <div>
                        <span className="font-semibold text-muted-foreground">Şikayet Edilen:</span>
                        <p>{selectedReport.reported?.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedReport.reported?.email}</p>
                    </div>
                </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 sm:space-y-0 space-y-2">
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
