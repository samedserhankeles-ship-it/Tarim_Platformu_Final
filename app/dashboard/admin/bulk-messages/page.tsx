"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { sendBulkMessageAction } from "@/app/actions/admin"; // Admin action to send bulk messages


export default function AdminBulkMessagesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [messageContent, setMessageContent] = useState("");
  const [targetRoles, setTargetRoles] = useState("");


  const handleSendBulkMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageContent.trim()) {
      toast({ title: "Hata", description: "Mesaj içeriği boş olamaz.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      const result = await sendBulkMessageAction(messageContent, targetRoles);
      if (result.success) {
        toast({ title: "Başarılı", description: result.message });
        setMessageContent("");
        setTargetRoles("");
      } else {
        toast({ title: "Hata", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Toplu Mesaj Gönder</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Yeni Toplu Mesaj Oluştur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendBulkMessage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-content">Mesaj İçeriği</Label>
              <Textarea
                id="message-content"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Göndermek istediğiniz mesajı buraya yazın..."
                rows={7}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-roles">Hedef Roller (İsteğe Bağlı, Virgülle Ayırın)</Label>
              <Input
                id="target-roles"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="Örn: FARMER,BUSINESS (Boş bırakılırsa tüm kullanıcılara gider)"
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Toplu Mesaj Gönder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
