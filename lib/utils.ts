import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateNumericId(): string {
  // 13 haneli timestamp
  const timestamp = Date.now().toString();
  
  // 7 haneli random sayı (1000000 ile 9999999 arası)
  const randomPart = Math.floor(1000000 + Math.random() * 9000000).toString();
  
  // Toplam 20 hane
  return timestamp + randomPart;
}

