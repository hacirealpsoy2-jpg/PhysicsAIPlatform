import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  blocked: boolean("blocked").notNull().default(false),
  bannedUntil: timestamp("banned_until"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const solveRequestSchema = z.object({
  parts: z.array(z.object({
    text: z.string().optional(),
    inlineData: z.object({
      mimeType: z.string(),
      data: z.string(),
    }).optional(),
  })).min(1, "En az bir soru parçası gerekli"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type SolveRequest = z.infer<typeof solveRequestSchema>;

export interface SolutionResponse {
  konu: string;
  istenilen: string;
  verilenler: string;
  cozum: string;
  sonuc: string;
}
