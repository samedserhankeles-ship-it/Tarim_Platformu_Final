import Link from "next/link";
import { ArrowRight, Tractor, Wheat, Users, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ana Sayfa",
  description: "Çiftçiler, biçerdöver operatörleri ve tüccarlar için güvenli ticaret platformu. İş gücünüzü bulun, ürününüzü değerinde satın.",
  openGraph: {
    title: "TarımPazar - Türkiye'nin Tarım İstihdam ve Ticaret Platformu",
    description: "Çiftçiler, biçerdöver operatörleri ve tüccarlar için güvenli ticaret platformu. İş gücünüzü bulun, ürününüzü değerinde satın.",
  },
};

export default function Home() {
  const heroParagraphText = "Çiftçiler, biçerdöver operatörleri ve tüccarlar tek platformda. İş gücünüzü bulun, ürününüzü değerinde satın.";

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TarımPazar",
    "description": "Türkiye'nin tarım istihdam ve ticaret platformu",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://tarimpazar.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || "https://tarimpazar.com"}/explore?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TarımPazar",
    "description": "Tarım sektöründe istihdam ve ticaret platformu",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://tarimpazar.com",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
        {/* HERO SECTION - Padding Azaltıldı */}
        <section className="w-full pt-16 md:pt-24 pb-12 bg-gradient-to-b from-background to-accent/20">
          <div className="w-full px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-block rounded-lg bg-secondary/20 px-3 py-1 text-sm text-secondary-foreground mb-4 font-semibold mx-auto">
                🚜 Türkiye'nin Çiftçi Ağı
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-foreground">
                Tarladan Sofraya <br className="hidden sm:inline" />
                <span className="text-primary">Güvenli Ticaret</span>
              </h1>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl mt-4">
                {heroParagraphText}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto justify-center">
                <Link
                  href="/auth/sign-up"
                  className="inline-flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Hemen Başla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-input bg-background px-8 text-lg font-bold shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  İlanları İncele
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="w-full py-12 bg-background">
          <div className="w-full px-4 md:px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Neden TarımPazar?</h2>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center p-6 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Geniş İş Ağı</h3>
                <p className="text-muted-foreground">
                  Binlerce operatör ve mevsimlik işçi ile anında iletişim kurun.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-secondary/20 rounded-full mb-4">
                  <Wheat className="h-10 w-10 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ürün Pazarı</h3>
                <p className="text-muted-foreground">
                  Hasat ettiğiniz ürünleri komisyonsuz ve doğrudan alıcıya ulaştırın.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Güvenli Ödeme</h3>
                <p className="text-muted-foreground">
                  Doğrulanmış kullanıcılar ve güvenli altyapı ile ticaret yapın.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    </>
  );
}