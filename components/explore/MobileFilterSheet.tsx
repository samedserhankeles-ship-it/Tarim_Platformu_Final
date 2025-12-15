"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { FilterSidebar } from "./FilterSidebar";
import { Badge } from "@/components/ui/badge";

export function MobileFilterSheet() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  
  // Aktif filtre sayısını hesapla
  const activeFiltersCount = 
    (searchParams.getAll("type").length) +
    (searchParams.getAll("category").length) +
    (searchParams.get("city") ? 1 : 0) +
    (searchParams.get("district") ? 1 : 0) +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Filter className="h-4 w-4" />
          Filtrele
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>İlan Filtreleri</SheetTitle>
          <SheetDescription>
            İstediğiniz kriterlere göre ilanları filtreleyin
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <FilterSidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}

