"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Label'ı da import et

interface ImageUploadFieldProps {
  id: string;
  name: string; // Form data key'i
  label: string;
  defaultValue?: string | null;
  onFileChange?: (file: File | null) => void;
  variant?: "avatar" | "banner"; // Avatar veya Banner için farklı UI
  fallbackText?: string; // Avatar için fallback metin (örn: Uİ)
  currentValue?: string | null; // Mevcut resim URL'i
}

export function ImageUploadField({ 
  id, 
  name, 
  label, 
  defaultValue, 
  onFileChange, 
  variant = "avatar",
  fallbackText,
  currentValue // Backend'den gelen mevcut değer
}: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // defaultValue değiştiğinde preview'ı güncelle
  // Bu, dışarıdan gelen bir prop değiştiğinde component'in kendini güncellemesini sağlar
  // Özellikle kaydetme sonrası sayfa yenilenmediğinde veya initial render'da önem taşır.
  // useEffect(() => {
  //   setPreview(defaultValue || null);
  // }, [defaultValue]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileChange?.(file); // Parent component'e bildir
    } else {
      setPreview(defaultValue || null);
      onFileChange?.(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Avatar için fallback metin mantığı
  const avatarFallback = fallbackText ? fallbackText.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="sr-only">{label}</Label> {/* Label'ı ekledim */}
      <div 
        className={`relative cursor-pointer group flex items-center justify-center overflow-hidden 
          ${variant === "avatar" ? "h-32 w-32 rounded-full border-4 border-background bg-primary/20 mx-auto" : "h-32 w-full rounded-md bg-gray-200"}`
        }
        onClick={handleClick}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`${label} Önizleme`} className="h-full w-full object-cover" />
        ) : (
          variant === "avatar" ? (
            <Avatar className="h-full w-full">
              <AvatarFallback className="text-4xl bg-primary/10 text-primary">{avatarFallback}</AvatarFallback>
            </Avatar>
          ) : (
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-30" />
          )
        )}
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-inherit">
          <Camera className="text-white h-8 w-8" />
        </div>
        
        <input 
          type="file" 
          id={id}
          name={name} 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      {/* Input'u açmak için ayrı bir button */}
      <Button variant="outline" className="w-full" type="button" onClick={handleClick}>
        {label} Değiştir
      </Button>
    </div>
  );
}
