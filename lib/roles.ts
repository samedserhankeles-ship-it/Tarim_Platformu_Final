// Rol isimlerini Türkçe'ye çeviren helper fonksiyonlar

export const ROLE_LABELS: Record<string, string> = {
  FARMER: "Çiftçi",
  BUSINESS: "İşletme",
  OPERATOR: "Operatör",
  ADMIN: "Admin", // Admin rolü hala sistemde olabilir ama seçeneklerde gösterilmez
};

export function getRoleLabel(role: string | null | undefined): string {
  if (!role) return "Kullanıcı";
  return ROLE_LABELS[role] || role;
}

export const AVAILABLE_ROLES = [
  { value: "FARMER", label: "Çiftçi" },
  { value: "BUSINESS", label: "İşletme" },
  { value: "OPERATOR", label: "Operatör" },
];



