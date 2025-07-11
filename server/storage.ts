import {
  users,
  folders,
  templates,
  reports,
  chatMessages,
  type User,
  type UpsertUser,
  type Folder,
  type InsertFolder,
  type Template,
  type InsertTemplate,
  type Report,
  type InsertReport,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Folder operations
  getFolders(userId: string): Promise<Folder[]>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  deleteFolder(id: number): Promise<void>;
  
  // Template operations
  getTemplates(userId?: string): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
  
  // Report operations
  getReports(userId: string): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  getReportForUser(id: number, userId: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, report: Partial<InsertReport>): Promise<Report>;
  deleteReport(id: number): Promise<void>;
  
  // Chat message operations
  getChatMessages(userId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  deleteChatMessages(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Ensure General folder exists for user
    try {
      const existingGeneral = await db
        .select()
        .from(folders)
        .where(and(eq(folders.userId, user.id), eq(folders.name, "General")))
        .limit(1);

      if (existingGeneral.length === 0) {
        await db
          .insert(folders)
          .values({
            userId: user.id,
            name: "General"
          });
      }
    } catch (error) {
      console.log("General folder creation skipped:", error);
    }

    return user;
  }

  // Folder operations
  async getFolders(userId: string): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(eq(folders.userId, userId))
      .orderBy(folders.name);
  }

  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db
      .insert(folders)
      .values(folder)
      .returning();
    return newFolder;
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  // Template operations
  async getTemplates(userId?: string): Promise<Template[]> {
    if (userId) {
      return await db.select().from(templates)
        .where(eq(templates.userId, userId))
        .orderBy(desc(templates.createdAt));
    }
    
    return [];
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db.insert(templates).values(template).returning();
    return newTemplate;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Report operations
  async getReports(userId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.userId, userId))
      .orderBy(desc(reports.createdAt));
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }
  
  // SECURITY: Get report with user verification
  async getReportForUser(id: number, userId: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), eq(reports.userId, userId)));
    return report;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async updateReport(id: number, report: Partial<InsertReport>): Promise<Report> {
    const [updatedReport] = await db
      .update(reports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();
    return updatedReport;
  }

  async deleteReport(id: number): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  // Chat message operations
  async getChatMessages(userId: string, limit = 100): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  async deleteChatMessages(userId: string): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }
}

export const storage = new DatabaseStorage();
