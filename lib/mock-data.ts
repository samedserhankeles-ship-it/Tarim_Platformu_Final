// Tüm uygulama genelinde tutarlı kullanıcı verisi
export const CURRENT_USER = {
  name: "Ahmet Yılmaz",
  role: "Çiftçi",
  image: "https://placehold.co/150x150/emerald/white?text=AY",
  email: "ahmet@tarim.com",
  notifications: 3
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: "Siparişiniz Onaylandı", desc: "Domates siparişiniz alıcı tarafından onaylandı.", time: "10 dk önce", read: false },
  { id: 2, title: "Yeni İş İlanı", desc: "Bölgenizde yeni bir traktör operatörü aranıyor.", time: "1 saat önce", read: false },
  { id: 3, title: "Mesajınız Var", desc: "Mehmet Demir size bir mesaj gönderdi.", time: "3 saat önce", read: false },
];