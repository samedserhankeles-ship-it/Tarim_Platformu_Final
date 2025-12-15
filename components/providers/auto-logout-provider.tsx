"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";

// 1 Saat = 60 dakika * 60 saniye * 1000 milisaniye
const INACTIVITY_LIMIT = 60 * 60 * 1000; 

export function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Zamanlayıcıyı başlatan fonksiyon
    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        // Süre dolduğunda yapılacak işlemler
        // Sadece oturum varsa çıkış yapmalı, ama logoutAction zaten session yoksa bir şey yapmaz veya güvenlidir.
        // Ancak sürekli istek atmaması için bir kontrol iyi olurdu ama client side session kontrolü şu an yok.
        // Server action çağrısı güvenlidir.
        
        await logoutAction(); 
        // logoutAction içinde redirect("/") var ama client tarafında da garanti olsun diye:
        // router.push("/"); 
      }, INACTIVITY_LIMIT);
    };

    // Kullanıcı etkileşimlerini dinleyeceğimiz olaylar
    const events = [
        "mousedown", // Fare tıklaması
        "mousemove", // Fare hareketi
        "keydown",   // Klavye tuşlaması
        "scroll",    // Kaydırma
        "touchstart" // Dokunmatik ekran teması
    ];
    
    // İlk yüklemede zamanlayıcıyı başlat
    resetTimer();

    // Olayları dinle ve zamanlayıcıyı sıfırla
    const handleActivity = () => {
      resetTimer();
    };

    // Event listener'ları ekle
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup: Bileşen unmount olduğunda listener'ları ve timer'ı temizle
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [router]); // router bağımlılığı

  return <>{children}</>;
}
