import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { authMiddleware, adminMiddleware, generateToken, type AuthRequest } from "./middleware/auth";
import { solvePhysicsProblem } from "./lib/gemini";
import { insertUserSchema, loginSchema, solveRequestSchema } from "@shared/schema";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin" },
});

const solveLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Dakikada en fazla 10 soru çözülebilir" },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", limiter);

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "Kullanıcı başarıyla oluşturuldu",
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (error: any) {
      console.error("Register error:", error);
      return res.status(400).json({ message: error.message || "Kayıt başarısız" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
      }

      if (user.blocked) {
        return res.status(403).json({ message: "Hesabınız engellenmiş" });
      }

      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Kullanıcı adı veya şifre hatalı" });
      }

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      return res.json({
        token,
        user: { id: user.id, username: user.username, role: user.role },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return res.status(400).json({ message: error.message || "Giriş başarısız" });
    }
  });

  app.post("/api/solve", authMiddleware, solveLimiter, async (req: AuthRequest, res) => {
    try {
      const validatedData = solveRequestSchema.parse(req.body);

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: "Gemini API anahtarı yapılandırılmamış" });
      }

      const solution = await solvePhysicsProblem(validatedData.parts);
      return res.json(solution);
    } catch (error: any) {
      console.error("Solve error:", error);
      return res.status(500).json({ message: error.message || "Soru çözülürken hata oluştu" });
    }
  });

  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        blocked: u.blocked,
        bannedUntil: u.bannedUntil,
      }));
      return res.json({ users: safeUsers });
    } catch (error: any) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Kullanıcılar yüklenemedi" });
    }
  });

  app.patch("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.password) {
        delete updates.password;
      }

      const updatedUser = await storage.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      return res.json({
        message: "Kullanıcı güncellendi",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role,
          blocked: updatedUser.blocked,
        },
      });
    } catch (error: any) {
      console.error("Update user error:", error);
      return res.status(500).json({ message: "Kullanıcı güncellenemedi" });
    }
  });

  app.delete("/api/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      if (req.user?.id === id) {
        return res.status(400).json({ message: "Kendi hesabınızı silemezsiniz" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı" });
      }

      return res.json({ message: "Kullanıcı silindi" });
    } catch (error: any) {
      console.error("Delete user error:", error);
      return res.status(500).json({ message: "Kullanıcı silinemedi" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
