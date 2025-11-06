import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.resolve("./data/users.json");

async function loadUsers(): Promise<Map<string, User>> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const parsed: User[] = JSON.parse(data);
    return new Map(parsed.map((u) => [u.id, u]));
  } catch {
    return new Map(); // dosya yoksa boş Map dön
  }
}

async function saveUsers(users: Map<string, User>): Promise<void> {
  const data = JSON.stringify(Array.from(users.values()), null, 2);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, data, "utf-8");
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
}

export class FileStorage implements IStorage {
  private users: Map<string, User> = new Map();

  constructor() {
    this.init();
  }

  private async init() {
    this.users = await loadUsers();
  }

  private async persist() {
    await saveUsers(this.users);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: "user",
      blocked: false,
      bannedUntil: null,
    };
    this.users.set(id, user);
    await this.persist();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    await this.persist();
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = this.users.delete(id);
    await this.persist();
    return result;
  }
}

export const storage = new FileStorage();
