"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"
import { deleteTopicAction, deleteForumPostAction } from "@/app/actions/forum"
import { useRouter } from "next/navigation"

interface DeleteButtonProps {
    id: string; // Topic ID or Post ID
    type: "topic" | "post";
    topicId?: string; // Required if type is 'post' to revalidate path
}

export default function DeleteButton({ id, type, topicId }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm(type === "topic" ? "Bu konuyu tamamen silmek istediğinize emin misiniz?" : "Bu yorumu silmek istediğinize emin misiniz?")) return;

        startTransition(async () => {
            let result;
            if (type === "topic") {
                result = await deleteTopicAction(id);
            } else {
                if (!topicId) return; // Should not happen
                result = await deleteForumPostAction(id, topicId);
            }

            if (result.success) {
                toast.success(result.message);
                if (type === "topic") {
                    router.push("/community"); // Konu silinirse forum ana sayfasına dön
                }
            } else {
                toast.error(result.message);
            }
        });
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            disabled={isPending}
            title="Sil"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
