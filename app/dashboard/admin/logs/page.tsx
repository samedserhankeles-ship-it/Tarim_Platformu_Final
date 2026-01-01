"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Activity, Search, Filter, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getActivityLogsAction } from "@/app/actions/admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupByUser, setGroupByUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");

  useEffect(() => {
    startTransition(async () => {
      const result = await getActivityLogsAction();
      if (result.success) {
        setLogs(result.data || []);
      }
    });
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
        log.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === "ALL" || log.user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  // Kullanıcıya göre gruplama mantığı
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const userId = log.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: log.user,
        logs: []
      };
    }
    acc[userId].logs.push(log);
    return acc;
  }, {} as Record<string, { user: any, logs: any[] }>);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("LOGIN")) return "default";
    if (action.includes("REGISTER")) return "outline";
    if (action.includes("CREATE")) return "secondary";
    if (action.includes("DELETE") || action.includes("BAN")) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Activity className="h-8 w-8 text-primary" />
                Denetim Kayıtları
            </h1>
            <div className="relative w-full md:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Kullanıcı veya işlem ara..." 
                    className="pl-8" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border">
            <div className="flex flex-wrap gap-2">
                <Button 
                    variant={selectedRole === "ALL" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedRole("ALL")}
                    className="rounded-full"
                >
                    Hepsi
                </Button>
                <Button 
                    variant={selectedRole === "FARMER" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedRole("FARMER")}
                    className="rounded-full"
                >
                    Çiftçi
                </Button>
                <Button 
                    variant={selectedRole === "BUSINESS" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedRole("BUSINESS")}
                    className="rounded-full"
                >
                    İşletme
                </Button>
                <Button 
                    variant={selectedRole === "OPERATOR" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedRole("OPERATOR")}
                    className="rounded-full"
                >
                    Operatör
                </Button>
                <Button 
                    variant={selectedRole === "ADMIN" ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setSelectedRole("ADMIN")}
                    className="rounded-full"
                >
                    Yönetici
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 px-3 rounded-full border shadow-sm">
                <Switch id="group-mode" checked={groupByUser} onCheckedChange={setGroupByUser} />
                <Label htmlFor="group-mode" className="text-sm font-medium cursor-pointer flex items-center gap-1 select-none">
                    <Users className="h-4 w-4" /> Grupla
                </Label>
            </div>
        </div>
      </div>

      {groupByUser ? (
          <div className="space-y-4">
              {Object.keys(groupedLogs).length === 0 ? (
                  <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">Kayıt bulunamadı.</CardContent>
                  </Card>
              ) : (
                  Object.values(groupedLogs).map((group: any) => (
                      <Card key={group.user.id} className="overflow-hidden">
                          <Accordion type="single" collapsible>
                              <AccordionItem value={group.user.id} className="border-none">
                                  <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
                                      <div className="flex items-center gap-4 text-left">
                                          <Avatar className="h-10 w-10 border">
                                              <AvatarFallback>{group.user.name?.[0] || "U"}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="font-bold text-base">{group.user.name}</p>
                                              <p className="text-xs text-muted-foreground">{group.user.email} • {group.user.role}</p>
                                          </div>
                                          <Badge variant="outline" className="ml-2">
                                              {group.logs.length} İşlem
                                          </Badge>
                                      </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="px-0 pb-0 border-t">
                                      <div className="bg-muted/10">
                                          <Table>
                                              <TableHeader>
                                                  <TableRow>
                                                      <TableHead>İşlem</TableHead>
                                                      <TableHead>Detay</TableHead>
                                                      <TableHead>Tarih</TableHead>
                                                      <TableHead className="w-[50px]"></TableHead>
                                                  </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                  {group.logs.map((log: any) => (
                                                      <TableRow key={log.id}>
                                                          <TableCell>
                                                              <Badge variant={getActionBadgeColor(log.action)} className="text-[10px]">
                                                                  {log.action}
                                                              </Badge>
                                                          </TableCell>
                                                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                              {log.details || "-"}
                                                          </TableCell>
                                                          <TableCell className="text-xs whitespace-nowrap">
                                                              {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: tr })}
                                                          </TableCell>
                                                          <TableCell>
                                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedLog(log)}>
                                                                  <Eye className="h-3 w-3" />
                                                              </Button>
                                                          </TableCell>
                                                      </TableRow>
                                                  ))}
                                              </TableBody>
                                          </Table>
                                      </div>
                                  </AccordionContent>
                              </AccordionItem>
                          </Accordion>
                      </Card>
                  ))
              )}
          </div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Detay</TableHead>
                  <TableHead>IP Adresi</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Kayıt bulunamadı.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{log.user.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{log.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getActionBadgeColor(log.action)}>
                                {log.action}
                            </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {log.details || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                            {log.ipAddress}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                            {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: tr })}
                        </TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                                <Eye className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>İşlem Detayı</DialogTitle>
                <DialogDescription>
                    İşlem ID: {selectedLog?.id}
                </DialogDescription>
            </DialogHeader>
            {selectedLog && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-semibold block text-muted-foreground">Kullanıcı:</span>
                            {selectedLog.user.name} ({selectedLog.user.email})
                        </div>
                        <div>
                            <span className="font-semibold block text-muted-foreground">Rol:</span>
                            {selectedLog.user.role}
                        </div>
                        <div>
                            <span className="font-semibold block text-muted-foreground">İşlem:</span>
                            {selectedLog.action}
                        </div>
                        <div>
                            <span className="font-semibold block text-muted-foreground">Tarih:</span>
                            {format(new Date(selectedLog.createdAt), "dd MMMM yyyy HH:mm:ss", { locale: tr })}
                        </div>
                        <div>
                            <span className="font-semibold block text-muted-foreground">IP Adresi:</span>
                            {selectedLog.ipAddress}
                        </div>
                    </div>
                    
                    <div className="bg-muted p-4 rounded-md overflow-x-auto">
                        <span className="font-semibold block text-muted-foreground mb-2 text-xs uppercase">Detaylar (JSON):</span>
                        <pre className="text-xs font-mono">
                            {(() => {
                                try {
                                    return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                                } catch {
                                    return selectedLog.details;
                                }
                            })()}
                        </pre>
                    </div>

                    <div className="text-xs text-muted-foreground break-all">
                        <span className="font-semibold">User Agent:</span> {selectedLog.userAgent}
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
