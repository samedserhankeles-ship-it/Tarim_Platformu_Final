import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ActivityLog modeli için manuel insert (Çünkü createActivityLog server action ve burada kullanamayız)
// Simülasyon olduğu için doğrudan veritabanına yazacağız.

async function createLog(userId: string, action: string, details: any) {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      details: JSON.stringify(details),
      ipAddress: "127.0.0.1",
      userAgent: "Simulation Script"
    }
  });
}

async function main() {
  console.log("🚀 Aktivite simülasyonu başlıyor...");

  // 1. Kullanıcıları Rollerina Göre Grupla
  const farmers = await prisma.user.findMany({ where: { role: 'FARMER' }, take: 2 });
  const businesses = await prisma.user.findMany({ where: { role: 'BUSINESS' }, take: 2 });
  const operators = await prisma.user.findMany({ where: { role: 'OPERATOR' }, take: 2 });
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, take: 2 });

  const allUsers = [...farmers, ...businesses, ...operators, ...admins];

  if (allUsers.length === 0) {
    console.log("❌ Yeterli kullanıcı bulunamadı.");
    return;
  }

  // 2. Rastgele Aktiviteler Oluştur
  for (const user of allUsers) {
    console.log(`👤 ${user.name} (${user.role}) için işlemler yapılıyor...`);

    // LOGIN
    await createLog(user.id, "LOGIN", "Kullanıcı giriş yaptı.");
    
    // Rastgele bir işlem seç
    const randomAction = Math.floor(Math.random() * 4);

    if (user.role === 'FARMER' || user.role === 'BUSINESS') {
        if (randomAction === 0) {
            await createLog(user.id, "CREATE_PRODUCT", { title: "Yeni Ürün İlanı" });
        } else if (randomAction === 1) {
            await createLog(user.id, "SEND_MESSAGE", { receiverId: "system", type: "TEXT" });
        }
    }

    if (user.role === 'OPERATOR') {
        await createLog(user.id, "UPDATE_JOB", { id: "job-123", title: "Operatör İlanı Güncellendi" });
    }

    if (user.role === 'ADMIN') {
        await createLog(user.id, "DELETE_USER", { targetUserId: "user-xyz", reason: "Spam" });
        await createLog(user.id, "BAN_USER", { targetUserId: "user-abc", duration: 7 });
    }

    // LOGOUT
    await createLog(user.id, "LOGOUT", "Kullanıcı çıkış yaptı.");
  }

  console.log("✨ Tüm roller için aktivite kayıtları oluşturuldu.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
