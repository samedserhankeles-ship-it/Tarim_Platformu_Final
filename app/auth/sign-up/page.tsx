"use client"

import Link from "next/link";
import { Tractor, ArrowLeft, Users, Briefcase, Loader2 } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { useState, useTransition } from "react";

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result && !result.success) {
        setErrorMessage(result.message);
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
      <Link
        href="/"
        className="absolute left-4 top-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground md:left-8 md:top-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Ana Sayfaya Dön
      </Link>
      
      <div className="w-full max-w-lg space-y-8 rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-secondary/20 p-3">
            <Tractor className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kayıt Olun</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Tarım ağımıza katılın, fırsatları kaçırmayın.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Rol Seçimi */}
          <div className="grid grid-cols-3 gap-2">
            <label className="cursor-pointer">
              <input type="radio" name="role" value="farmer" className="peer sr-only" defaultChecked />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Users className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Çiftçi</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="role" value="operator" className="peer sr-only" />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Tractor className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Operatör</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="role" value="merchant" className="peer sr-only" />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Briefcase className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">İşletme</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium leading-none">Ad</label>
              <input id="firstName" name="firstName" placeholder="Adınız" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium leading-none">Soyad</label>
              <input id="lastName" name="lastName" placeholder="Soyadınız" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">E-posta</label>
            <input id="email" name="email" type="email" placeholder="ornek@tarim.com" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">Şifre</label>
            <input id="password" name="password" type="password" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>
          
          {errorMessage && (
             <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                {errorMessage}
             </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
             {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Hesap Oluşturuluyor...
                </>
            ) : (
                "Hesap Oluştur"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}