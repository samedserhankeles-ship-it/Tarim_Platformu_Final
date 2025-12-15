"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Ban, CheckCircle } from "lucide-react";
import { blockUserAction, unblockUserAction } from "@/app/actions/block";
import { useToast } from "@/hooks/use-toast";
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

interface BlockButtonProps {
  userId: string;
  initialIsBlocked: boolean; // Is the user currently blocked BY the current user?
}

export default function BlockButton({ userId, initialIsBlocked }: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleBlock = async () => {
    startTransition(async () => {
      const result = await blockUserAction(userId);
      if (result.success) {
        setIsBlocked(true);
        toast({
          title: "Kullanıcı Engellendi",
          description: "Bu kullanıcı artık size mesaj atamaz.",
        });
      } else {
        toast({
          title: "Hata",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleUnblock = async () => {
    startTransition(async () => {
      const result = await unblockUserAction(userId);
      if (result.success) {
        setIsBlocked(false);
        toast({
          title: "Engel Kaldırıldı",
          description: "Kullanıcı ile tekrar iletişime geçebilirsiniz.",
        });
      } else {
        toast({
          title: "Hata",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isBlocked) {
      return (
        <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-muted-foreground hover:bg-emerald-50 hover:text-emerald-600 border-dashed"
            onClick={handleUnblock}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Engeli Kaldır
        </Button>
      )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-red-600 hover:bg-red-50"
        >
            <Ban className="mr-2 h-4 w-4" />
            Kullanıcıyı Engelle
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Kullanıcıyı engellemek istiyor musunuz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu kullanıcıyı engellerseniz size mesaj gönderemez ve iletişim bilgilerinizi göremez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlock} 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "İşleniyor..." : "Engelle"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
