import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileSettingsPage from "./_profile-settings-client";

export default async function SettingsPageWrapper() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/sign-in");
  }

  // Ensure all expected fields are present, even if null
  const initialUserData = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    image: currentUser.image,
    phone: currentUser.phone,
    bio: currentUser.bio,
    city: currentUser.city,
    district: currentUser.district,
    crops: currentUser.crops,
    certificates: currentUser.certificates,
    role: currentUser.role,
  };

  return <ProfileSettingsPage initialUserData={initialUserData} />;
}
