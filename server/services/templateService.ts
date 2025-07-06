import { storage } from "../storage";
import { InsertTemplate, Template } from "@shared/schema";

export class TemplateService {
  private defaultTemplates: Array<Omit<InsertTemplate, "userId">> = [
    {
      name: "Chest X-ray",
      description: "Standard chest radiograph template",
      content: `CHEST X-RAY REPORT

CLINICAL HISTORY: {clinical_history}

TECHNIQUE: Single frontal chest radiograph

FINDINGS: {findings}

IMPRESSION: {impression}

RECOMMENDATIONS: {recommendations}`,
      category: "Chest Imaging",
      isDefault: true,
    },
    {
      name: "CT Abdomen",
      description: "Abdominal CT scan template",
      content: `CT ABDOMEN AND PELVIS REPORT

CLINICAL HISTORY: {clinical_history}

TECHNIQUE: Axial CT images of the abdomen and pelvis with IV contrast

FINDINGS: {findings}

IMPRESSION: {impression}

RECOMMENDATIONS: {recommendations}`,
      category: "CT Imaging",
      isDefault: true,
    },
    {
      name: "MRI Brain",
      description: "Brain MRI examination template",
      content: `MRI BRAIN REPORT

CLINICAL HISTORY: {clinical_history}

TECHNIQUE: Multiplanar MRI of the brain including T1, T2, and FLAIR sequences

FINDINGS: {findings}

IMPRESSION: {impression}

RECOMMENDATIONS: {recommendations}`,
      category: "MRI Imaging",
      isDefault: true,
    },
    {
      name: "Ultrasound",
      description: "General ultrasound template",
      content: `ULTRASOUND REPORT

CLINICAL HISTORY: {clinical_history}

TECHNIQUE: Real-time ultrasound examination

FINDINGS: {findings}

IMPRESSION: {impression}

RECOMMENDATIONS: {recommendations}`,
      category: "Ultrasound",
      isDefault: true,
    },
  ];

  async initializeDefaultTemplates(): Promise<void> {
    try {
      // Check if default templates already exist
      const existingDefaults = await storage.getTemplates();
      
      if (existingDefaults.length === 0) {
        // Create default templates
        for (const template of this.defaultTemplates) {
          await storage.createTemplate({
            ...template,
            userId: null, // Default templates don't belong to specific users
          });
        }
        console.log("Default templates initialized");
      }
    } catch (error) {
      console.error("Error initializing default templates:", error);
    }
  }

  async processUploadedTemplate(
    userId: string,
    fileName: string,
    content: string,
    category: string
  ): Promise<Template> {
    const name = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
    
    const template: InsertTemplate = {
      userId,
      name,
      description: `Uploaded template: ${fileName}`,
      content,
      category,
      isDefault: false,
    };

    return await storage.createTemplate(template);
  }

  async getTemplatesByCategory(userId?: string): Promise<Record<string, Template[]>> {
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
