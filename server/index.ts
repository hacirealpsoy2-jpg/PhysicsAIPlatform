import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import http from "http";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// JSON ve URL-encoded veriler için 20MB limit ayarı
app.use(express.json({
  limit: '20mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({
  limit: '20mb',
  extended: false
}));

// API request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const { initializeAdminUser } = await import("./lib/init");
  await initializeAdminUser();

  const appServer = await registerRoutes(app);

  // Hata yakalama middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("❌ Server error:", err);
  });

  // Vite setup (sadece development)
  if (app.get("env") === "development") {
    await setupVite(app, appServer);
  } else {
    serveStatic(app);
  }

  // ✅ Render uyumlu HTTP sunucusu
  const server = http.createServer(app);

  // 🔧 Timeout sorunlarını engellemek için
  server.keepAliveTimeout = 120000; // 2 dakika
  server.headersTimeout = 120000;   // 2 dakika

  // 🔥 Render portu (Render bunu otomatik atar)
  const port = parseInt(process.env.PORT || "10000", 10);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    log(`🚀 Fizik Çözüm Platformu çalışıyor: http://${host}:${port}`);
  });
})();
