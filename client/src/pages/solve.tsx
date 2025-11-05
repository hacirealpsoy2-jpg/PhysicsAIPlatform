import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Image as ImageIcon, Send, LogOut, Copy, Check } from "lucide-react";
import type { SolutionResponse } from "@shared/schema";

export default function Solve() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [questionText, setQuestionText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<SolutionResponse & { konuOzet?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLocation("/login");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "Dosya çok büyük",
        description: "Lütfen 8MB'dan küçük bir resim yükleyin",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!questionText && !image) {
      toast({
        title: "Uyarı",
        description: "Lütfen bir soru metni girin veya görsel yükleyin",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSolution(null);

    try {
      const parts: any[] = [];
      
      if (questionText) {
        parts.push({ text: questionText });
      }
      
      if (image) {
        const base64Data = image.split(",")[1];
        const mimeType = image.split(";")[0].split(":")[1];
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
      }

      const token = localStorage.getItem("token");
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ parts }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Çözüm oluşturulamadı");
      }

      const data = await response.json();
      setSolution(data);
      
      toast({
        title: "Başarılı!",
        description: "Soru çözüldü",
      });
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Soru çözülürken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!solution) return;
    
    const text = `
KONU: ${solution.konu}

İSTENİLEN:
${solution.istenilen}

VERİLENLER:
${solution.verilenler}

ÇÖZÜM:
${solution.cozum}

SONUÇ:
${solution.sonuc}

KONU ÖZETİ:
${solution.konuOzet || "-"}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Kopyalandı!",
      description: "Çözüm panoya kopyalandı",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card border-b border-card-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Fizik Çözüm Platformu</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Hoş geldiniz, <span className="font-medium text-foreground">{user.username}</span>
            </span>
            {user.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/admin")}
                data-testid="button-admin-panel"
              >
                Admin Paneli
              </Button>
            )}
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Soru Girişi</CardTitle>
                <CardDescription>
                  Fizik sorunuzu metin olarak yazın veya görsel yükleyin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Soru Metni</label>
                  <Textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Sorunuzu buraya yazın..."
                    className="min-h-32 resize-none"
                    disabled={isLoading}
                    data-testid="input-question-text"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Görsel Yükle</label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    data-testid="area-image-upload"
                  >
                    {image ? (
                      <div className="space-y-4">
                        <img
                          src={image}
                          alt="Yüklenen soru görseli"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImage(null);
                          }}
                          data-testid="button-remove-image"
                        >
                          Görseli Kaldır
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Görsel yüklemek için tıklayın veya sürükleyin
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Maksimum 8MB (PNG, JPG, JPEG)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    data-testid="input-image-file"
                  />
                </div>

                <Button
                  onClick={handleSolve}
                  disabled={isLoading || (!questionText && !image)}
                  className="w-full py-3"
                  data-testid="button-solve"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Çözülüyor...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Soruyu Çöz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {isLoading && (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                    <p className="text-lg font-medium">Soru çözülüyor...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isLoading && !solution && (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium">Çözüm burada görünecek</p>
                    <p className="text-sm text-muted-foreground">
                      Sorunuzu girin ve çöz butonuna tıklayın
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {solution && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Çözüm</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    data-testid="button-copy-solution"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>

                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full" data-testid="badge-topic">
                        {solution.konu}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">İstenilen</h3>
                      <p className="text-base leading-relaxed">{solution.istenilen}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Verilenler</h3>
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{solution.verilenler}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Çözüm</h3>
                      <div className="space-y-3">
                        <p className="text-base leading-7 whitespace-pre-wrap font-mono text-lg">
                          {solution.cozum}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
                      <h3 className="text-lg font-semibold mb-2">Sonuç</h3>
                      <p className="text-base font-medium font-mono text-lg">{solution.sonuc}</p>
                    </div>

                    {solution.konuOzet && (
                      <div className="p-4 border-2 border-secondary rounded-lg bg-secondary/10">
                        <h3 className="text-lg font-semibold mb-2">Konu Özeti</h3>
                        <p className="text-base leading-relaxed text-gray-800" style={{ fontFamily: "Arial, sans-serif" }}>
                          {solution.konuOzet}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
