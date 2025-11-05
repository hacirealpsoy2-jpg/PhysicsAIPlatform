import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogOut, Trash2, Ban, Check, Users, Shield } from "lucide-react";
import type { User } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (currentUser.role !== "admin") {
      toast({
        title: "Yetkisiz Erişim",
        description: "Admin paneline erişim yetkiniz yok",
        variant: "destructive",
      });
      setLocation("/solve");
      return;
    }
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Kullanıcılar yüklenemedi");
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Kullanıcılar yüklenirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, blocked: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ blocked: !blocked }),
      });

      if (!response.ok) {
        throw new Error("Kullanıcı güncellenemedi");
      }

      toast({
        title: "Başarılı",
        description: blocked ? "Kullanıcı engeli kaldırıldı" : "Kullanıcı engellendi",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İşlem başarısız",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Kullanıcı silinemedi");
      }

      toast({
        title: "Başarılı",
        description: "Kullanıcı silindi",
      });

      loadUsers();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Silme işlemi başarısız",
        variant: "destructive",
      });
    } finally {
      setDeleteUserId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-card-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Paneli</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/solve")}
              data-testid="button-solve-page"
            >
              Çözüm Sayfası
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Kullanıcı Yönetimi
                </CardTitle>
                <CardDescription className="mt-2">
                  Tüm kullanıcıları görüntüleyin ve yönetin
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {users.length} Kullanıcı
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-16 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Kullanıcılar yükleniyor...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Kullanıcı bulunamadı</p>
                <p className="text-sm text-muted-foreground">Henüz kayıtlı kullanıcı yok</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Kullanıcı Adı</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Rol</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Durum</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-border hover-elevate transition-colors"
                          data-testid={`row-user-${user.id}`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <span className="font-medium" data-testid={`text-username-${user.id}`}>
                                {user.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                              {user.id.substring(0, 8)}...
                            </code>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              data-testid={`badge-role-${user.id}`}
                            >
                              {user.role === "admin" ? "Admin" : "Kullanıcı"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={user.blocked ? "destructive" : "outline"}
                              className="rounded-full"
                              data-testid={`badge-status-${user.id}`}
                            >
                              {user.blocked ? "Engelli" : "Aktif"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {user.id !== currentUser.id && (
                                <>
                                  <Button
                                    variant={user.blocked ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={() => handleToggleBlock(user.id, user.blocked)}
                                    data-testid={`button-toggle-block-${user.id}`}
                                  >
                                    {user.blocked ? (
                                      <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Engeli Kaldır
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="w-4 h-4 mr-1" />
                                        Engelle
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteUserId(user.id)}
                                    data-testid={`button-delete-${user.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {users.map((user) => (
                    <Card key={user.id} data-testid={`card-user-${user.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium" data-testid={`text-username-${user.id}`}>
                                {user.username}
                              </p>
                              <code className="text-xs text-muted-foreground">
                                {user.id.substring(0, 12)}...
                              </code>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge
                              variant={user.role === "admin" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {user.role === "admin" ? "Admin" : "Kullanıcı"}
                            </Badge>
                            <Badge
                              variant={user.blocked ? "destructive" : "outline"}
                              className="text-xs rounded-full"
                            >
                              {user.blocked ? "Engelli" : "Aktif"}
                            </Badge>
                          </div>
                        </div>

                        {user.id !== currentUser.id && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant={user.blocked ? "outline" : "secondary"}
                              size="sm"
                              onClick={() => handleToggleBlock(user.id, user.blocked)}
                              className="w-full"
                              data-testid={`button-toggle-block-${user.id}`}
                            >
                              {user.blocked ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Engeli Kaldır
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-1" />
                                  Engelle
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteUserId(user.id)}
                              className="w-full"
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Sil
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
