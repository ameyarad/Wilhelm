import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { groqService } from "./services/groqService";
import { templateService } from "./services/templateService";
import { insertTemplateSchema, insertReportSchema, insertChatMessageSchema } from "@shared/schema";
import multer from "multer";
import { ZodError } from "zod";
import {
  apiRateLimit,
  aiRateLimit,
  uploadRateLimit,
  validateTextInput,
  validateReportInput,
  validateIdParam,
  handleValidationErrors,
  fileUploadSecurity
} from "./middleware/security";

const upload = multer({ 
  storage: multer.memoryStorage(),
  ...fileUploadSecurity
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth required)
  app.get('/health', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      secure: isSecure,
      host: req.get('host'),
      protocol: req.protocol,
      headers: {
        'x-forwarded-proto': req.headers['x-forwarded-proto'],
        'x-forwarded-for': req.headers['x-forwarded-for']
      },
      ssl: {
        enforced: isProduction,
        ready: isProduction ? isSecure : true
      }
    });
  });

  // SSL readiness check endpoint (no auth required)
  app.get('/.well-known/ssl-check', (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      ssl_ready: true,
      environment: process.env.NODE_ENV || 'development',
      secure_connection: isSecure,
      https_enforced: isProduction,
      host: req.get('host'),
      user_agent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
  });

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
  app.post('/api/ai/transcribe', isAuthenticated, aiRateLimit, upload.single('audio'), async (req: any, res) => {
    try {
      console.log("Transcribe request received:", {
        hasFile: !!req.file,
        fileSize: req.file?.size,
        mimeType: req.file?.mimetype,
        originalName: req.file?.originalname
      });
      
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const transcription = await groqService.transcribeAudio(req.file.buffer);
      console.log("Transcription successful:", transcription.text.substring(0, 50) + "...");
      res.json(transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ message: "Failed to transcribe audio", error: errorMessage });
    }
  });

  app.post('/api/ai/generate-report', isAuthenticated, aiRateLimit, async (req: any, res) => {
    try {
      const { findings } = req.body;
      const userId = req.user.claims.sub;
      
      if (!findings) {
        return res.status(400).json({ message: "Findings are required" });
      }

      // Moderate content before processing
      const moderation = await groqService.moderateContent(findings);
      if (!moderation.isSafe) {
        return res.status(400).json({ 
          message: 'Content moderation failed', 
          violations: moderation.violations 
        });
      }

      // Get available templates for this user
      const templates = await storage.getTemplates(userId);
      const templatesForAI = templates.map(t => ({
        name: t.name,
        content: t.content,
      }));

      const result = await groqService.generateReport(findings, templatesForAI);
      
      // Moderate the generated report as well
      const reportModeration = await groqService.moderateContent(result.report);
      if (!reportModeration.isSafe) {
        return res.status(500).json({ 
          message: 'Generated report failed moderation', 
          violations: reportModeration.violations 
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
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

  app.post('/api/templates/upload', isAuthenticated, upload.array('templates', 10), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      console.log("Upload request received:", {
        userId,
        hasFiles: !!req.files,
        fileCount: req.files ? req.files.length : 0,
        body: req.body,
        headers: req.headers['content-type']
      });
      
      if (!req.files || req.files.length === 0) {
        console.log("No files in request");
        return res.status(400).json({ message: "No template files provided" });
      }

      const processedTemplates = [];
      const errors = [];

      for (const file of req.files) {
        try {
          let content = '';
          const fileName = file.originalname;
          const fileExtension = fileName.split('.').pop()?.toLowerCase();

          console.log(`Processing file: ${fileName}, type: ${fileExtension}, size: ${file.size}`);

          // Handle different file types
          if (fileExtension === 'docx') {
            try {
              const mammoth = await import('mammoth');
              // Use convertToHtml to preserve formatting for rich text editor
              const result = await mammoth.convertToHtml({ buffer: file.buffer });
              content = result.value;
              console.log("Successfully extracted HTML from docx:", content.substring(0, 100) + "...");
            } catch (mammothError) {
              console.error("Error extracting text from docx:", mammothError);
              throw new Error("Failed to process docx file: " + mammothError.message);
            }
          } else if (fileExtension === 'doc') {
            // For .doc files, use word-extractor library for proper parsing
            try {
              const WordExtractor = await import('word-extractor');
              const extractor = new WordExtractor.default();
              const extracted = await extractor.extract(file.buffer);
              
              // Get the raw text content
              let rawContent = extracted.getBody();
              
              // Convert plain text to HTML to preserve basic formatting
              content = rawContent
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>')
                .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
              
              console.log("Successfully extracted and formatted text from .doc file, content length:", content.length);
            } catch (docError) {
              console.error("Error extracting from .doc file:", docError);
              // Fallback: manual text extraction using improved regex with basic formatting
              const utf8Text = file.buffer.toString('utf-8');
              const textMatches = utf8Text.match(/[\w\s\.\,\:\;\!\?\-\(\)\[\]]{8,}/g);
              if (textMatches && textMatches.length > 0) {
                let rawContent = textMatches
                  .filter(match => match.trim().length > 5) // Filter out short fragments
                  .join(' ')
                  .replace(/\s+/g, ' ')
                  .trim();
                
                // Convert to HTML formatting
                content = rawContent
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/\n/g, '<br>')
                  .replace(/^/, '<p>')
                  .replace(/$/, '</p>')
                  .replace(/<p><\/p>/g, '');
              } else {
                content = "<p>Error: Could not extract readable text from this .doc file. Please try uploading as .docx or .txt format.</p>";
              }
              console.log("Fallback .doc processing with formatting, content length:", content.length);
            }
          } else {
            // For .txt files, convert to HTML to preserve basic formatting
            const rawContent = file.buffer.toString('utf-8');
            content = rawContent
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br>')
              .replace(/^/, '<p>')
              .replace(/$/, '</p>')
              .replace(/<p><\/p>/g, ''); // Remove empty paragraphs
          }

          const template = await templateService.processUploadedTemplate(
            userId,
            fileName,
            content,
            req.body.folder || "General"
          );

          processedTemplates.push(template);
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          errors.push({
            fileName: file.originalname,
            error: fileError instanceof Error ? fileError.message : "Failed to process file"
          });
        }
      }

      // Return success even if some files failed
      res.json({
        success: processedTemplates.length > 0,
        processedCount: processedTemplates.length,
        totalCount: req.files.length,
        templates: processedTemplates,
        errors: errors
      });
    } catch (error) {
      console.error("Error uploading templates:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload templates";
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

  // Update template folder
  app.patch("/api/templates/:id/folder", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = parseInt(req.params.id);
      const { folder } = req.body;
      
      if (!folder || typeof folder !== 'string') {
        return res.status(400).json({ message: "Folder name is required" });
      }

      // Check if template belongs to user
      const existingTemplate = await storage.getTemplate(id);
      if (!existingTemplate || existingTemplate.userId !== userId) {
        return res.status(404).json({ message: "Template not found" });
      }

      const updatedTemplate = await storage.updateTemplate(id, { folder });
      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating template folder:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all folders for user
  app.get("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folders = await storage.getFolders(userId);
      res.json(folders);
    } catch (error) {
      console.error("Error getting folders:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Create new folder
  app.post("/api/folders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "Folder name is required" });
      }

      const folder = await storage.createFolder({ userId, name });
      res.json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete folder and move templates to General
  app.delete("/api/folders/:name", isAuthenticated, async (req: any, res) => {
    try {
      const folderName = decodeURIComponent(req.params.name);
      const userId = req.user.claims.sub;
      
      if (folderName === "General") {
        return res.status(400).json({ message: "Cannot delete General folder" });
      }

      // Move all templates from this folder to General
      const templates = await storage.getTemplates(userId);
      const templatesInFolder = templates.filter(t => t.folder === folderName);
      
      await Promise.all(
        templatesInFolder.map(template => 
          storage.updateTemplate(template.id, { folder: "General" })
        )
      );

      res.json({ message: "Folder deleted and templates moved to General" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: error.message });
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
