import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentUser } from "@/lib/auth"; 
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Area with Header */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header user={user} />
        <main className="flex-1 w-full p-4 md:p-6 bg-muted/10">
          <div className="w-full max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
