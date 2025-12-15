import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { MasterHeader } from "@/components/layout/master-header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tarimpazar.com'),
  title: {
    default: "TarımPazar - Türkiye'nin Tarım İstihdam ve Ticaret Platformu",
    template: "%s | TarımPazar"
  },
  description: "Çiftçiler, biçerdöver operatörleri ve tüccarlar için güvenli ticaret platformu. İş gücünüzü bulun, ürününüzü değerinde satın. Komisyonsuz tarım pazarı.",
  keywords: ["tarım", "çiftçi", "istihdam", "biçerdöver", "tarım iş ilanları", "tarım ürünleri", "tarım ticareti", "mevsimlik işçi", "traktör operatörü"],
  authors: [{ name: "TarımPazar" }],
  creator: "TarımPazar",
  publisher: "TarımPazar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "TarımPazar",
    title: "TarımPazar - Türkiye'nin Tarım İstihdam ve Ticaret Platformu",
    description: "Çiftçiler, biçerdöver operatörleri ve tüccarlar için güvenli ticaret platformu. İş gücünüzü bulun, ürününüzü değerinde satın.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TarımPazar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TarımPazar - Türkiye'nin Tarım İstihdam ve Ticaret Platformu",
    description: "Çiftçiler, biçerdöver operatörleri ve tüccarlar için güvenli ticaret platformu.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Google Search Console verification kodu buraya eklenecek
    // google: "verification_token_here",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="tr" className="w-full overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen w-full overflow-x-hidden`}>
        <MasterHeader user={user} />
        <main className="flex-1 w-full overflow-x-hidden">{children}</main>
        <Footer />
        <Toaster richColors position="top-right" />
        <ShadcnToaster />
      </body>
    </html>
  );
}
