"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions/social";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DeletePostButton({ postId }: { postId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm("Bu gönderiyi ve ilgili tüm yorum/beğenileri kalıcı olarak silmek istiyor musunuz?")) return;

        startTransition(async () => {
            const result = await deletePostAction(postId);
            if (result.success) {
                toast.success("Gönderi silindi.");
                router.refresh(); // Listeyi güncelle
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start" 
            onClick={handleDelete}
            disabled={isPending}
        >
            <Trash2 className="mr-2 h-4 w-4" /> Sil
        </Button>
    );
}
