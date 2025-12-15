"use client" // Client-side chart rendering

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, MessageSquare, Package, Eye, Filter } from "lucide-react";
import { getReportStats, getMonthlyActivity, getUserListingsForReports } from "@/app/actions/raporlar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming this table component exists

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']; // for charts

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, monthlyData, listingsData] = await Promise.all([
          getReportStats(),
          getMonthlyActivity(),
          getUserListingsForReports()
        ]);
        setStats(statsData);
        setMonthlyActivity(monthlyData);
        setUserListings(listingsData);
      } catch (error) {
        console.error("Rapor verileri çekilirken hata oluştu:", error);
        toast.error("Rapor verileri yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-48 text-muted-foreground">Yükleniyor...</div>;
  }

  if (!stats) {
    return <div className="flex justify-center items-center h-48 text-destructive">Rapor verileri yüklenemedi veya oturum açılmadı.</div>;
  }

  // İlan durumu dağılımı için mock data (gerçekte DB'den çekilmeli)
  const listingStatusData = [
    { name: 'Aktif', value: stats.activeListings },
    { name: 'Pasif', value: stats.totalListings - stats.activeListings },
  ];


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Raporlar ve İstatistikler</h1>
        <p className="text-muted-foreground">
          Platformdaki faaliyetlerinizin özetini buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Genel Metrikler */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İlan</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeListings} tanesi aktif
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Görüntülenme</CardTitle>
            <Eye className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              (Tahmini)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yeni Mesajlar</CardTitle>
            <MessageSquare className="h-4 w-4 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newMessages}</div>
            <p className="text-xs text-muted-foreground">
              Okunmamış mesajlarınız
            </p>
          </CardContent>
        </Card>
        {stats.estimatedRevenue !== null && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kazanç (Tahmini)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{stats.estimatedRevenue}</div>
            <p className="text-xs text-muted-foreground">
              Aktif ürün satışlarından
            </p>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Grafik Alanları */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>İlan Durumu Dağılımı</CardTitle>
            <CardDescription>Aktif ve pasif ilanlarınızın oranı.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={listingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: { name?: string | number; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {listingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aylık İlan ve Mesaj Aktivitesi</CardTitle>
            <CardDescription>İlan ve mesajlarınızın aylık trendi.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyActivity} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="listings" stroke="#8884d8" name="İlan Sayısı" />
                <Line type="monotone" dataKey="messages" stroke="#82ca9d" name="Mesaj Sayısı" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Verilen İlanlar Tablosu */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Verilen İlanlar</CardTitle>
            <CardDescription>Oluşturduğunuz tüm ilanların detaylı listesi.</CardDescription>
          </div>
          {/* Export button placeholder */}
          <Button variant="outline" size="sm">Dışa Aktar (CSV)</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori / Konum</TableHead>
                  <TableHead>Fiyat / Ücret</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Görüntülenme</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Henüz ilanınız bulunmamaktadır.
                    </TableCell>
                  </TableRow>
                ) : (
                  userListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell>{listing.location || listing.category || "Belirtilmemiş"}</TableCell>
                      <TableCell>{listing.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          listing.status === "Aktif" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {listing.status}
                        </span>
                      </TableCell>
                      <TableCell>{listing.views}</TableCell>
                      <TableCell>{listing.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          {/* Pagination or more info */}
        </CardFooter>
      </Card>
    </div>
  );
}