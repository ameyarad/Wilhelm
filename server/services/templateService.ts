import { storage } from "../storage";
import { InsertTemplate, Template } from "@shared/schema";

export class TemplateService {
  // No default templates - users will upload their own

  async processUploadedTemplate(
    userId: string,
    fileName: string,
    content: string,
    category: string,
    folder?: string
  ): Promise<Template> {
    const name = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    const template: InsertTemplate = {
      userId,
      name,
      description: `Uploaded template: ${fileName}`,
      content,
      category,
      folder: folder || "General",
      fileType: fileExtension === 'doc' || fileExtension === 'docx' ? fileExtension : 'txt',
    };

    return await storage.createTemplate(template);
  }

  async getTemplatesByFolder(userId: string): Promise<Record<string, Template[]>> {
    const templates = await storage.getTemplates(userId);
    const templatesByFolder: Record<string, Template[]> = {};

    templates.forEach(template => {
      const folder = template.folder || "General";
      if (!templatesByFolder[folder]) {
        templatesByFolder[folder] = [];
      }
      templatesByFolder[folder].push(template);
    });

    return templatesByFolder;
  }

  async getTemplatesByCategory(userId: string): Promise<Record<string, Template[]>> {
    const templates = await storage.getTemplates(userId);
    const templatesByCategory: Record<string, Template[]> = {};

    templates.forEach(template => {
      if (!templatesByCategory[template.category]) {
        templatesByCategory[template.category] = [];
      }
      templatesByCategory[template.category].push(template);
    });

    return templatesByCategory;
  }

  async findBestTemplate(findings: string, availableTemplates: Template[]): Promise<Template | null> {
    if (availableTemplates.length === 0) {
      return null;
    }

    // Simple keyword matching for template selection
    const keywords = findings.toLowerCase();
    
    const scores = availableTemplates.map(template => {
      let score = 0;
      const templateName = template.name.toLowerCase();
      const templateCategory = template.category.toLowerCase();
      
      // Check for direct matches
      if (keywords.includes(templateName)) score += 10;
      if (keywords.includes(templateCategory)) score += 5;
      
      // Check for specific imaging keywords
      if (keywords.includes("chest") && templateName.includes("chest")) score += 8;
      if (keywords.includes("abdomen") && templateName.includes("abdomen")) score += 8;
      if (keywords.includes("brain") && templateName.includes("brain")) score += 8;
      if (keywords.includes("ct") && templateName.includes("ct")) score += 6;
      if (keywords.includes("mri") && templateName.includes("mri")) score += 6;
      if (keywords.includes("ultrasound") && templateName.includes("ultrasound")) score += 6;
      if (keywords.includes("x-ray") && templateName.includes("x-ray")) score += 6;
      
      return { template, score };
    });

    const bestMatch = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return bestMatch.score > 0 ? bestMatch.template : null;
  }
}

export const templateService = new TemplateService();