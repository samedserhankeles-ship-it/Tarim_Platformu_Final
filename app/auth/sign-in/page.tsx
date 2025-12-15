"use client"

import Link from "next/link";
import { Tractor, ArrowLeft, Loader2 } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button"; // Eğer component varsa kullanalım, yoksa html button

export default function SignInPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      // loginAction içinde redirect olduğu için başarılıysa burası çalışmaz,
      // ama hata dönerse buraya düşeriz.
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
      
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-card p-6 shadow-sm md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Tractor className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Hoş Geldiniz</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Hesabınıza giriş yaparak platformu kullanmaya devam edin.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              E-posta
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ornek@tarim.com"
              className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Şifre
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Şifremi Unuttum?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
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
                    Giriş Yapılıyor...
                </>
            ) : (
                "Giriş Yap"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
            Hemen Kayıt Olun
          </Link>
        </div>
      </div>
    </div>
  );
}