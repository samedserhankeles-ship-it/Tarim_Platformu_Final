// Rol isimlerini Türkçe'ye çeviren helper fonksiyonlar

export const ROLE_LABELS: Record<string, string> = {
  FARMER: "Çiftçi",
  WORKER: "İşçi / Mevsimlik İşçi",
  ENGINEER: "Ziraat Mühendisi",
  BUSINESS: "İşletme / Tüccar",
  OPERATOR: "Operatör (Traktör/Biçerdöver)",
  SUPPLIER: "Tedarikçi",
  ADMIN: "Admin", // Admin rolü hala sistemde olabilir ama seçeneklerde gösterilmez
};

export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return "Kullanıcı";
  return ROLE_LABELS[role] || role;
}

export const AVAILABLE_ROLES = [
  { value: "FARMER", label: "Çiftçi" },
  { value: "WORKER", label: "İşçi / Mevsimlik İşçi" },
  { value: "ENGINEER", label: "Ziraat Mühendisi" },
  { value: "BUSINESS", label: "İşletme / Tüccar" },
  { value: "OPERATOR", label: "Operatör (Traktör/Biçerdöver)" },
  { value: "SUPPLIER", label: "Tedarikçi" },
];



