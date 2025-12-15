"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="w-full border-t py-6 bg-muted/30 mt-auto">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-6 mx-auto">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; 2025 TarımPazar. Tüm hakları saklıdır.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4">
            Gizlilik
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:underline underline-offset-4">
            Kullanım Şartları
          </Link>
        </div>
      </div>
    </footer>
  );
}