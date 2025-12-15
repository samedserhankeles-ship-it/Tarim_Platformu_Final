"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash, Eye, MapPin } from "lucide-react";
import Link from "next/link";
import { deleteListingAction } from "@/app/actions/admin";
import { useTransition } from "react";
import { toast } from "sonner";

export default function ListingCard({ listing }: { listing: any }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
        startTransition(async () => {
            const result = await deleteListingAction(listing.id, listing.type);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }
  };

  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Yayında", variant: "default" },
    pending: { label: "Onay Bekliyor", variant: "secondary" },
    passive: { label: "Pasif", variant: "outline" },
  };

  const status = listing.status || "active"; // Varsayılan

  return (
    <Card className="overflow-hidden group flex flex-col">
        <div className="aspect-video w-full overflow-hidden bg-muted relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
            src={listing.image} 
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 right-2">
            <Badge variant={statusMap[status].variant}>
                {statusMap[status].label}
            </Badge>
        </div>
        </div>
        
        <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">{listing.title}</h3>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menü</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                    <Link href={`/ilan/${listing.type === 'product' ? 'prod-' : 'job-'}${listing.id}`} className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" /> Görüntüle
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                    <Link href={`/dashboard/ilan-duzenle/${listing.id}`} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Düzenle
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    <Trash className="mr-2 h-4 w-4" /> 
                    {isPending ? "Siliniyor..." : "İlanı Sil"}
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-1">
        <div className="flex flex-col gap-1 mt-2">
            <span className="text-xl font-bold text-primary">{listing.price}</span>
            <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 mr-1" />
            {listing.location}
            </div>
        </div>
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between">
        <span>{listing.type === "job" ? "İş İlanı" : "Ürün"}</span>
        <span>{listing.date}</span>
        </CardFooter>
    </Card>
  );
}
