"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

// Bu fonksiyonlar şimdilik yer tutucudur. Gerçek veri çekme mantığı buraya eklenecektir.

export async function getReportStats() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/auth/sign-in"); // Oturum açmamışsa giriş sayfasına yönlendir
    }

    // Kullanıcıya özel istatistikler
    const userProducts = await prisma.product.count({
        where: { userId: currentUser.id }
    });
    
    const userJobs = await prisma.jobPosting.count({
        where: { userId: currentUser.id }
    });
    
    const totalListings = userProducts + userJobs;
    
    const activeProducts = await prisma.product.count({
        where: { userId: currentUser.id, active: true }
    });
    
    const activeJobs = await prisma.jobPosting.count({
        where: { userId: currentUser.id, active: true }
    });
    
    const activeListings = activeProducts + activeJobs;

    // Kullanıcının mesajlarını say (kullanıcının gönderdiği veya aldığı mesajlar)
    const sentMessages = await prisma.message.count({
        where: { senderId: currentUser.id }
    });
    
    const receivedMessages = await prisma.message.count({
        where: { receiverId: currentUser.id }
    });
    
    const totalMessages = sentMessages + receivedMessages;
    
    const unreadMessages = await prisma.message.count({
        where: { 
            receiverId: currentUser.id,
            isRead: false 
        }
    });

    // Aktif ürünlerden tahmini kazanç hesapla (sadece aktif ürünler için)
    const activeProductsList = await prisma.product.findMany({
        where: { userId: currentUser.id, active: true },
        select: { price: true }
    });
    
    const estimatedRevenue = activeProductsList.reduce((sum, product) => {
        return sum + Number(product.price);
    }, 0);

    return {
        totalListings,
        activeListings,
        totalViews: totalListings * 10, // Tahmini görüntülenme (her ilan için 10 görüntülenme varsayımı)
        newMessages: unreadMessages,
        totalMessages,
        estimatedRevenue: estimatedRevenue > 0 ? estimatedRevenue : null,
    };
}

export async function getMonthlyActivity() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/auth/sign-in"); // Oturum açmamışsa giriş sayfasına yönlendir
    }

    // Kullanıcının kendi aylık aktivitesini göster
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) { // Son 6 ayı al, eskiden yeniye doğru
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Ayın son günü

        const monthName = date.toLocaleString("tr-TR", { month: "short" });

        // Kullanıcının kendi ilanlarını say
        const listingsCount = await prisma.product.count({
            where: {
                userId: currentUser.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        }) + await prisma.jobPosting.count({
            where: {
                userId: currentUser.id,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Kullanıcının gönderdiği ve aldığı mesajları say
        const messagesCount = await prisma.message.count({
            where: {
                OR: [
                    { senderId: currentUser.id },
                    { receiverId: currentUser.id }
                ],
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Tahmini görüntülenme
        const viewsCount = listingsCount * 15; // İlan başına 15 görüntüleme varsayımı

        data.push({
            month: monthName,
            listings: listingsCount,
            messages: messagesCount,
            views: viewsCount,
        });
    }
    return data;
}

export async function getUserListingsForReports() {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        redirect("/auth/sign-in"); // Oturum açmamışsa giriş sayfasına yönlendir
    }

    // Kullanıcının kendi ilanlarını getir
    const userProducts = await prisma.product.findMany({
        where: { userId: currentUser.id },
        select: {
            id: true,
            title: true,
            category: true,
            price: true,
            active: true,
            createdAt: true,
            city: true,
            district: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const userJobs = await prisma.jobPosting.findMany({
        where: { userId: currentUser.id },
        select: {
            id: true,
            title: true,
            workType: true,
            wage: true,
            active: true,
            createdAt: true,
            city: true,
            district: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    // İlanları birleştir ve formatla
    const allListings = [
        ...userProducts.map(product => ({
            id: `prod-${product.id}`,
            title: product.title,
            category: product.category || "Ürün",
            price: `${product.price} ₺`,
            status: product.active ? "Aktif" : "Pasif",
            views: Math.floor(Math.random() * 50) + 10, // Tahmini görüntülenme
            date: product.createdAt.toLocaleDateString("tr-TR"),
            location: [product.city, product.district].filter(Boolean).join(", ") || "Belirtilmemiş",
        })),
        ...userJobs.map(job => ({
            id: `job-${job.id}`,
            title: job.title,
            category: job.workType || "İş İlanı",
            price: `${job.wage} ₺/Ay`,
            status: job.active ? "Aktif" : "Pasif",
            views: Math.floor(Math.random() * 50) + 10,
            date: job.createdAt.toLocaleDateString("tr-TR"),
            location: [job.city, job.district].filter(Boolean).join(", ") || "Belirtilmemiş",
        })),
    ];

    return allListings;
}
