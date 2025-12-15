"use server";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User as PrismaUser } from "@prisma/client";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  city: string | null;
  district: string | null;
  createdAt: Date;
  phone: string | null;
  isBanned: boolean;
  bannedUntil: Date | null;
  banReason: string | null;
  isRestricted: boolean;
  restrictionReason: string | null;
}

export async function fetchUsersAction(query: string): Promise<UserData[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/"); // Redirect non-admins
  }

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query } },
      { email: { contains: query } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      city: true,
      district: true,
      createdAt: true,
      phone: true,
      isBanned: true,
      bannedUntil: true,
      banReason: true,
      isRestricted: true,
      restrictionReason: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return users;
}
