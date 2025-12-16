"use client"

import Link from "next/link";
import { Tractor, ArrowLeft, Users, Briefcase, Loader2 } from "lucide-react";
import { signUpAction } from "@/app/actions/auth";
import { useState, useTransition } from "react";
import { TermsModal } from "@/components/auth/TermsModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Input componentini import et

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("farmer"); // Rolü takip etmek için state

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null);

    if (!termsAccepted) {
      setErrorMessage("Kayıt olabilmek için sözleşmeleri kabul etmelisiniz.");
      return;
    }

    // Seçilen role göre alanların dolu olup olmadığını kontrol et
    if (selectedRole === "business") {
      const companyName = formData.get("companyName") as string;
      if (!companyName || companyName.trim() === "") {
        setErrorMessage("İşletme Adı boş bırakılamaz.");
        return;
      }
    } else {
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      if (!firstName || firstName.trim() === "" || !lastName || lastName.trim() === "") {
        setErrorMessage("Ad ve Soyad boş bırakılamaz.");
        return;
      }
    }


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
              <input 
                type="radio" 
                name="role" 
                value="farmer" 
                className="peer sr-only" 
                checked={selectedRole === "farmer"} 
                onChange={(e) => setSelectedRole(e.target.value)} 
              />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Users className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Çiftçi</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="operator" 
                className="peer sr-only" 
                checked={selectedRole === "operator"} 
                onChange={(e) => setSelectedRole(e.target.value)} 
              />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Tractor className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">Operatör</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input 
                type="radio" 
                name="role" 
                value="business" 
                className="peer sr-only" 
                checked={selectedRole === "business"} 
                onChange={(e) => setSelectedRole(e.target.value)} 
              />
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                <Briefcase className="mb-2 h-6 w-6" />
                <span className="text-xs font-semibold">İşletme</span>
              </div>
            </label>
          </div>

          {selectedRole === "business" ? (
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium leading-none">İşletme Adı</Label>
              <Input id="companyName" name="companyName" placeholder="İşletmenizin Adı" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium leading-none">Ad</Label>
                <Input id="firstName" name="firstName" placeholder="Adınız" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium leading-none">Soyad</Label>
                <Input id="lastName" name="lastName" placeholder="Soyadınız" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium leading-none">E-posta</Label>
            <Input id="email" name="email" type="email" placeholder="ornek@tarim.com" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium leading-none">Şifre</Label>
            <Input id="password" name="password" type="password" className="flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required />
          </div>

          {/* Sözleşme Onayı */}
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <TermsModal />
                'nı okudum ve kabul ediyorum.
              </Label>
            </div>
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