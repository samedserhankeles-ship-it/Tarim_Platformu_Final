import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { markNotificationsAsReadAction } from "@/app/actions/notification"; // Import the action

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Mark all unread notifications for this user as read upon page load
  await markNotificationsAsReadAction();

  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "WARNING": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "ERROR": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-full">
            <Bell className="h-6 w-6 text-emerald-700" />
        </div>
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Bildirimler</h1>
            <p className="text-muted-foreground text-sm">Hesabınızla ilgili tüm güncellemeler.</p>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-20" />
              <p>Henüz hiç bildiriminiz yok.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`transition-colors ${!notification.isRead ? "bg-muted/30 border-l-4 border-l-emerald-500" : ""}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1 shrink-0">
                   {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.isRead && <Badge variant="secondary" className="text-[10px] h-5">Yeni</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(notification.createdAt).toLocaleString("tr-TR")}
                    </span>
                    {notification.link && (
                        <Link href={notification.link} className="text-xs font-medium text-emerald-600 hover:underline">
                            Görüntüle →
                        </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
