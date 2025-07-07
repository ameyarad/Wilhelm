import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { groqService } from "./services/groqService";
import { templateService } from "./services/templateService";
import { insertTemplateSchema, insertReportSchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";
import { ZodError } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // No default templates - users will upload their own

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat routes
  app.get('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
      });

      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Error creating chat message:", error);
        res.status(500).json({ message: "Failed to create chat message" });
      }
    }
  });

  app.delete('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteChatMessages(userId);
      res.json({ message: "Chat messages deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat messages:", error);
      res.status(500).json({ message: "Failed to delete chat messages" });
    }
  });

  // AI routes
  app.post('/api/ai/transcribe', isAuthenticated, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const transcription = await groqService.transcribeAudio(req.file.buffer);
      res.json(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ message: "Failed to transcribe audio" });
    }
  });

  app.post('/api/ai/generate-report', isAuthenticated, async (req: any, res) => {
    try {
      const { findings } = req.body;
      
      if (!findings) {
        return res.status(400).json({ message: "Findings are required" });
      }

      // Get available templates
      const templates = await storage.getTemplates();
      const templatesForAI = templates.map(t => ({
        name: t.name,
        content: t.content,
        category: t.category,
      }));

      const result = await groqService.generateReport(findings, templatesForAI);
      res.json(result);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.post('/api/ai/enhance-findings', isAuthenticated, async (req: any, res) => {
    try {
      const { findings } = req.body;
      
      if (!findings) {
        return res.status(400).json({ message: "Findings are required" });
      }

      const enhancedFindings = await groqService.enhanceFindings(findings);
      res.json({ enhancedFindings });
    } catch (error) {
      console.error("Error enhancing findings:", error);
      res.status(500).json({ message: "Failed to enhance findings" });
    }
  });

  // Template routes
  app.get('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.get('/api/templates/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templates = await templateService.getTemplatesByFolder(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by folder:", error);
      res.status(500).json({ message: "Failed to fetch templates by folder" });
    }
  });

  app.post('/api/templates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const templateData = insertTemplateSchema.parse({
        ...req.body,
        userId,
      });

      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid template data", errors: error.errors });
      } else {
        console.error("Error creating template:", error);
        res.status(500).json({ message: "Failed to create template" });
      }
    }
  });

  app.post('/api/templates/upload', isAuthenticated, upload.single('template'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log("Upload request received:", {
        userId,
        hasFile: !!req.file,
        body: req.body,
        headers: req.headers['content-type']
      });
      
      if (!req.file) {
        console.log("No file in request");
        return res.status(400).json({ message: "No template file provided" });
      }

      let content = '';
      const fileName = req.file.originalname;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      console.log(`Processing file: ${fileName}, type: ${fileExtension}, size: ${req.file.size}`);

      // Handle different file types
      if (fileExtension === 'docx') {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ buffer: req.file.buffer });
          content = result.value;
          console.log("Successfully extracted text from docx:", content.substring(0, 100) + "...");
        } catch (mammothError) {
          console.error("Error extracting text from docx:", mammothError);
          throw new Error("Failed to process docx file: " + mammothError.message);
        }
      } else if (fileExtension === 'doc') {
        // For .doc files, extract readable text and filter out binary data
        const rawContent = req.file.buffer.toString('utf-8');
        // Remove null bytes and other binary characters that cause DB issues
        content = rawContent.replace(/\0/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
        console.log("Processed .doc file, content length:", content.length);
      } else {
        // For .txt files
        content = req.file.buffer.toString('utf-8');
      }

      const template = await templateService.processUploadedTemplate(
        userId,
        fileName,
        content,
        req.body.folder || "General"
      );

      res.json(template);
    } catch (error) {
      console.error("Error uploading template:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload template";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.get('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.put('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const templateData = insertTemplateSchema.partial().parse(req.body);
      
      // Check if template belongs to user
      const existingTemplate = await storage.getTemplate(id);
      if (!existingTemplate || existingTemplate.userId !== userId) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      const template = await storage.updateTemplate(id, templateData);
      res.json(template);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid template data", errors: error.errors });
      } else {
        console.error("Error updating template:", error);
        res.status(500).json({ message: "Failed to update template" });
      }
    }
  });

  app.delete('/api/templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      
      // Check if template belongs to user
      const existingTemplate = await storage.getTemplate(id);
      if (!existingTemplate || existingTemplate.userId !== userId) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      await storage.deleteTemplate(id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Report routes
  app.get('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertReportSchema.parse({
        ...req.body,
        userId,
      });

      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid report data", errors: error.errors });
      } else {
        console.error("Error creating report:", error);
        res.status(500).json({ message: "Failed to create report" });
      }
    }
  });

  app.get('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.put('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const reportData = insertReportSchema.partial().parse(req.body);
      
      const report = await storage.updateReport(id, reportData);
      res.json(report);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid report data", errors: error.errors });
      } else {
        console.error("Error updating report:", error);
        res.status(500).json({ message: "Failed to update report" });
      }
    }
  });

  app.delete('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReport(id);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
