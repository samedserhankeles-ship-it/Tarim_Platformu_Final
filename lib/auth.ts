import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session_user_id")?.value

  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        isBanned: true, // Fetch ban status
        bannedUntil: true, // Fetch ban expiration
        banReason: true, // Fetch ban reason
        phone: true,       // Add phone
        bio: true,         // Add bio
        city: true,        // Add city
        district: true,    // Add district
        crops: true,       // Add crops
        certificates: true, // Add certificates
        createdAt: true, // Add createdAt
        updatedAt: true, // Add updatedAt
        // Add other fields as needed
      }
    })

    console.log("getCurrentUser: Fetched user data:", user); // Diagnostic log

    if (!user) return null

    // Check if user is currently banned
    if (user.isBanned && user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        // User is banned and ban period is not over
        console.warn(`Banned user tried to log in: ${user.email}`);
        // Optionally, clear the session cookie to force re-login
        // cookies().delete("session_user_id"); 
        // For now, just return null, forcing UI to treat as logged out
        return null;
    }

    // Fetch unread notification count
    const unreadNotificationCount = await prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    });

    // Fetch active listings count for JobPostings
    const activeJobPostingsCount = await prisma.jobPosting.count({
      where: {
        userId: user.id,
        active: true,
      },
    });

    // Fetch active listings count for Products
    const activeProductsCount = await prisma.product.count({
      where: {
        userId: user.id,
        active: true,
      },
    });

    const activeListingsCount = activeJobPostingsCount + activeProductsCount;

    // Fetch passive listings count for JobPostings
    const passiveJobPostingsCount = await prisma.jobPosting.count({
      where: {
        userId: user.id,
        active: false,
      },
    });

    // Fetch passive listings count for Products
    const passiveProductsCount = await prisma.product.count({
      where: {
        userId: user.id,
        active: false,
      },
    });

    const passiveListingsCount = passiveJobPostingsCount + passiveProductsCount;

    // Fetch total favorites count for user's JobPostings
    const jobPostingsWithFavorites = await prisma.jobPosting.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: { favoritedBy: true },
        },
      },
    });

    const totalJobPostingsFavorites = jobPostingsWithFavorites.reduce((sum, jobPosting) => sum + jobPosting._count.favoritedBy, 0);

    // Fetch total favorites count for user's Products
    const productsWithFavorites = await prisma.product.findMany({
      where: {
        userId: user.id,
      },
      include: {
        _count: {
          select: { favoritedBy: true },
        },
      },
    });

    const totalProductsFavorites = productsWithFavorites.reduce((sum, product) => sum + product._count.favoritedBy, 0);

    const totalFavoritesCount = totalJobPostingsFavorites + totalProductsFavorites;


    return {
      ...user,
      unreadNotificationCount,
      activeListingsCount,
      passiveListingsCount,
      totalFavoritesCount,
    }
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
