import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditListingForm from "./edit-form";

async function getListing(id: string) {
  // id formatı yine "prod-xyz" veya "job-xyz" olabilir mi?
  // İlanlarım sayfasından buraya link verirken formatı netleştirmeliyiz.
  // İlanlarım sayfasında sadece ID'yi mi yoksa Tipi de mi gönderiyoruz?
  // En kolayı URL query param veya path param olarak tipi de almak.
  // Ama burada path sadece [id].
  // O zaman ID'ye göre her iki tabloda arayalım.
  
  const product = await prisma.product.findUnique({ where: { id } });
  if (product) return { ...product, type: "product" as const };

  const job = await prisma.jobPosting.findUnique({ where: { id } });
  if (job) return { ...job, type: "job" as const };

  return null;
}

export default async function EditListingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const listing = await getListing(params.id);

  if (!listing) {
    notFound();
  }

  // Decimal'i string'e çevir
  const plainListing = {
    ...listing,
    // @ts-ignore
    price: listing.price ? listing.price.toString() : (listing.wage ? listing.wage.toString() : "0"),
    // @ts-ignore
    wage: listing.wage ? listing.wage.toString() : null, 
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">İlanı Düzenle</h1>
        <p className="text-muted-foreground">
          İlan bilgilerinizi güncelleyin.
        </p>
      </div>
      <EditListingForm listing={plainListing} />
    </div>
  );
}
