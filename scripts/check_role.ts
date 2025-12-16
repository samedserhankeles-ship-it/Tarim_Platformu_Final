import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixUserRoles() {
  try {
    // 1. Revert the wrongly updated user
    try {
      const revertedUser = await prisma.user.update({
        where: { email: "samedserhankeles@hotmail.com" },
        data: { role: "FARMER" },
        select: { email: true, role: true }
      });
      console.log("Reverted:", revertedUser);
    } catch (e) {
      console.log("Could not revert samedserhankeles@hotmail.com (maybe not found)");
    }

    // 2. Update the correct user
    const targetUser = await prisma.user.update({
      where: { email: "ikmaltarim@hotmail.com" },
      data: { role: "BUSINESS" },
      select: { email: true, role: true }
    });
    console.log("Updated correct user:", targetUser);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserRoles();
