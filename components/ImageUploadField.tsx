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
    <div className="space-y-2 group/field w-full h-full"> {/* h-full eklendi */}
      <Label htmlFor={id} className="sr-only">{label}</Label>
      <div 
        className={`relative cursor-pointer group flex items-center justify-center overflow-hidden 
          ${variant === "avatar" ? "h-full w-full rounded-full border-4 border-background bg-primary/20" : "h-full w-full bg-muted"}` // h-32 yerine h-full
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
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
                <span className="text-sm font-medium opacity-50">Kapak Fotoğrafı Ekle</span>
            </div>
          )
        )}
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-inherit z-20">
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
      {/* Butonu kaldırdım çünkü görsele tıklamak yeterli ve daha şık */}
    </div>
  );
}
