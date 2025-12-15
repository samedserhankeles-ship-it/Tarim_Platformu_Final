"use client";

import { Button } from "@/components/ui/button";
import { Flag, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component
import { createReportAction } from "@/app/actions/report"; // Import the server action
import { useToast } from "@/hooks/use-toast";

interface ReportButtonProps {
  reportedUserId: string;
  reportedListingId?: string; // Optional: if reporting from a listing
  variant?: "ghost" | "default" | "outline" | "secondary" | "destructive" | "link";
  className?: string;
  isLoggedIn: boolean;
}

export default function ReportButton({ reportedUserId, reportedListingId, variant = "ghost", className, isLoggedIn }: ReportButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleReport = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Şikayet Edilemedi",
        description: "Şikayette bulunmak için lütfen giriş yapın.",
        variant: "destructive",
      });
      return;
    }
    
    startTransition(async () => {
      const result = await createReportAction(reportedUserId, reason, reportedListingId);
      if (result.success) {
        toast({
          title: "Şikayet İletildi",
          description: result.message,
        });
        setIsDialogOpen(false); // Close dialog on success
        setReason(""); // Clear reason
      } else {
        toast({
          title: "Şikayet Edilemedi",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Flag className="mr-2 h-4 w-4" />
          Şikayet Et
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kullanıcıyı Şikayet Et</AlertDialogTitle>
          <AlertDialogDescription>
            Lütfen şikayetinizin nedenini açıklayınız. Yaptığınız şikayetler gizli tutulacaktır.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
            <Textarea
                placeholder="Şikayet nedeninizi buraya yazın..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={5}
                disabled={isPending}
            />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReport} 
            disabled={isPending || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Şikayeti Gönder"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
