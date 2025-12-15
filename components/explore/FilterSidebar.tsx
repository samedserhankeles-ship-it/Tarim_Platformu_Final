"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RefreshCw } from "lucide-react";
import qs from "query-string";
import { turkeyLocations } from "@/lib/locations";

const categories = [
  { label: "Tahıl & Hububat", value: "tahil" },
  { label: "Sebze & Meyve", value: "sebze" },
  { label: "Hayvancılık", value: "hayvan" },
  { label: "Tarım Ekipmanı", value: "ekipman" },
];

export function FilterSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const currentDistricts = turkeyLocations.find(c => c.city === selectedCity)?.districts || [];

  // Sync state with URL params on mount/update
  useEffect(() => {
    const typeParams = searchParams.getAll("type");
    const categoryParams = searchParams.getAll("category");
    const cityParam = searchParams.get("city");
    const districtParam = searchParams.get("district");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    setSelectedTypes(typeParams);
    setSelectedCategories(categoryParams);
    setSelectedCity(cityParam || "");
    setSelectedDistrict(districtParam || "");
    // Only set price if it's different to avoid cursor jumping if we were to sync on every keystroke (though we handle price separately)
    if (minPriceParam !== minPrice) setMinPrice(minPriceParam || "");
    if (maxPriceParam !== maxPrice) setMaxPrice(maxPriceParam || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Helper to update URL
  const updateURL = useCallback((params: Record<string, any>) => {
    const currentParams = qs.parse(searchParams.toString());
    const mergedParams = { ...currentParams, ...params };
    
    // Clean up empty values
    Object.keys(mergedParams).forEach(key => {
        if (mergedParams[key] === "" || mergedParams[key] === null || (Array.isArray(mergedParams[key]) && mergedParams[key].length === 0)) {
            delete mergedParams[key];
        }
    });

    // Special handling for dependent fields
    if (params.hasOwnProperty('city') && !params.city) {
         delete mergedParams.district;
    }

    const newQuery = qs.stringify(mergedParams);
    router.replace(`/explore?${newQuery}`, { scroll: false });
  }, [searchParams, router]);


  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...selectedTypes, type] 
      : selectedTypes.filter((t) => t !== type);
    
    setSelectedTypes(newTypes);
    updateURL({ type: newTypes });
  };

  const handleCategoryChange = (categoryValue: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, categoryValue]
      : selectedCategories.filter((c) => c !== categoryValue);

    setSelectedCategories(newCategories);
    updateURL({ category: newCategories });
  };

  const handleCityChange = (val: string) => {
      setSelectedCity(val);
      setSelectedDistrict(""); // Reset district
      updateURL({ city: val, district: "" });
  };

  const handleDistrictChange = (val: string) => {
      setSelectedDistrict(val);
      updateURL({ district: val });
  };

  // Price updates on blur or enter
  const handlePriceUpdate = () => {
      updateURL({ minPrice, maxPrice });
  };

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setSelectedCity("");
    setSelectedDistrict("");
    setMinPrice("");
    setMaxPrice("");
    router.replace(`/explore`);
  };

  return (
    <aside className="md:flex w-64 flex-col gap-6 shrink-0 p-4 md:p-0">
      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
        <Filter className="h-5 w-5 text-emerald-600" /> İlan Filtreleri
      </h3>

      <div className="space-y-6">
        {/* TYPE FILTER */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">İlan Tipi</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-product" 
                checked={selectedTypes.includes("product")} 
                onCheckedChange={(checked) => handleTypeChange("product", !!checked)}
              />
              <label htmlFor="type-product" className="text-sm leading-none cursor-pointer">Ürün Satışı</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-barter" 
                checked={selectedTypes.includes("barter")} 
                onCheckedChange={(checked) => handleTypeChange("barter", !!checked)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600" 
              />
              <label htmlFor="type-barter" className="text-sm leading-none flex items-center gap-1 font-semibold text-purple-700 cursor-pointer">
                <RefreshCw className="h-3 w-3" /> Takas
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-job" 
                checked={selectedTypes.includes("job")} 
                onCheckedChange={(checked) => handleTypeChange("job", !!checked)}
              />
              <label htmlFor="type-job" className="text-sm leading-none cursor-pointer">İş İlanı</label>
            </div>
          </div>
        </div>

        <Separator />

        {/* CATEGORY FILTER */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Kategoriler</h4>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((category) => (
              <div key={category.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`cat-${category.value}`} 
                  checked={selectedCategories.includes(category.value)} 
                  onCheckedChange={(checked) => handleCategoryChange(category.value, !!checked)}
                />
                <label htmlFor={`cat-${category.value}`} className="text-sm leading-none cursor-pointer">
                  {category.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* LOCATION FILTER */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Konum</h4>
          
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">İl</label>
            <Select onValueChange={handleCityChange} value={selectedCity}>
                <SelectTrigger className="w-full">
                <SelectValue placeholder="İl Seçiniz" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                {turkeyLocations.map((loc) => (
                    <SelectItem key={loc.city} value={loc.city}>{loc.city}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">İlçe</label>
            <Select onValueChange={handleDistrictChange} value={selectedDistrict} disabled={!selectedCity}>
                <SelectTrigger className="w-full">
                <SelectValue placeholder="İlçe Seçiniz" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                {currentDistricts.map((dist) => (
                    <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* PRICE FILTER */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">Fiyat Aralığı (₺)</h4>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              placeholder="Min" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handlePriceUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
              className="w-1/2"
            />
            <span>-</span>
            <Input 
              type="number" 
              placeholder="Max" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handlePriceUpdate}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceUpdate()}
              className="w-1/2"
            />
          </div>
        </div>

        <Button onClick={handleResetFilters} variant="outline" className="w-full mt-2">
          Sıfırla
        </Button>
      </div>
    </aside>
  );
}