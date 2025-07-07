import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "",
});

export interface TranscriptionResult {
  text: string;
  confidence?: number;
}

export interface ReportGenerationResult {
  report: string;
  templateUsed: string;
  confidence: number;
}

export class GroqService {
  async transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
    try {
      // Generate unique filename to ensure complete isolation between calls
      const timestamp = Date.now();
      const filename = `audio_${timestamp}_${Math.random().toString(36).substring(7)}.webm`;
      
      const transcription = await groq.audio.transcriptions.create({
        file: new File([audioBuffer], filename, { type: "audio/webm" }),
        model: "whisper-large-v3-turbo",
        response_format: "json",
        // Remove language parameter to prevent any context carryover
        // Remove any prompt parameter to ensure complete isolation
        temperature: 0.0, // Deterministic output
      });

      return {
        text: transcription.text.trim(), // Trim any whitespace
        confidence: 0.95,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  async selectTemplate(
    findings: string,
    availableTemplates: Array<{ name: string; content: string }>
  ): Promise<string> {
    try {
      const templateExamples = [
        { role: "user", content: "Example 1\nModality: MRI\nBodyPart: Knee\nProtocol: 1.5 T proton-density fat-sat sagittal/coronal/axial\n→ {\"template\":\"KNEE_MRI\"}" },
        { role: "user", content: "Example 2\nModality: CT\nBodyPart: Chest / Abdomen / Pelvis with portal venous contrast\n→ {\"template\":\"CT_CAP_CE\"}" },
        { role: "user", content: "Example 3\nModality: X-ray\nBodyPart: Chest\nProtocol: PA and lateral views\n→ {\"template\":\"CHEST_XRAY\"}" }
      ];

      const templateList = availableTemplates
        .map(t => t.name)
        .join(", ");

      const messages = [
        {
          role: "system",
          content: `You are a radiology template-selection assistant. Output ONLY valid JSON matching this schema: {\"template\": <string>}. Available templates: ${templateList}`
        },
        ...templateExamples,
        {
          role: "user",
          content: `Now classify:\n${findings}`
        }
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        max_tokens: 100,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      try {
        const parsed = JSON.parse(response);
        return parsed.template || availableTemplates[0]?.name || "DEFAULT";
      } catch {
        // Fallback to first available template if JSON parsing fails
        return availableTemplates[0]?.name || "DEFAULT";
      }
    } catch (error) {
      console.error("Template selection error:", error);
      // Return first available template as fallback
      return availableTemplates[0]?.name || "DEFAULT";
    }
  }

  async generateReport(
    findings: string,
    availableTemplates: Array<{ name: string; content: string }>
  ): Promise<ReportGenerationResult> {
    try {
      // Step 1: Select the most appropriate template
      const selectedTemplateName = await this.selectTemplate(findings, availableTemplates);
      const selectedTemplate = availableTemplates.find(t => t.name === selectedTemplateName) || availableTemplates[0];

      if (!selectedTemplate) {
        throw new Error("No templates available");
      }

      // Step 2: Generate the report using the selected template
      const reportContent = await this.mergeWithTemplate(findings, selectedTemplate);

      return {
        report: reportContent,
        templateUsed: selectedTemplate.name,
        confidence: 0.9,
      };
    } catch (error) {
      console.error("Report generation error:", error);
      throw new Error("Failed to generate report");
    }
  }

  async mergeWithTemplate(
    findings: string,
    template: { name: string; content: string }
  ): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a professional radiologist AI assistant. Your task is to merge clinical findings into a radiology report template and generate a complete, well-formatted report.

Guidelines:
- Use the provided template structure as your foundation
- Fill in all relevant sections with information from the clinical findings
- Maintain professional medical language and format
- Include appropriate medical terminology
- If findings don't specify certain details, use appropriate medical language like "No acute abnormalities detected" or "Within normal limits"
- Ensure the report flows logically and reads naturally
- Output only the final formatted report, no additional text or explanations`
        },
        {
          role: "user",
          content: `Template: ${template.name}

Template Structure:
${template.content}

Clinical Findings:
${findings}

Please generate a complete radiology report by merging the clinical findings into the template structure.`
        }
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from Groq API");
      }

      return response.trim();
    } catch (error) {
      console.error("Report generation error:", error);
      throw new Error("Failed to generate report");
    }
  }

  async enhanceFindings(findings: string): Promise<string> {
    try {
      const prompt = `As a radiologist, please review and enhance the following clinical findings. Correct any obvious errors, standardize medical terminology, and ensure clarity while maintaining the original meaning:

Original Findings:
${findings}

Please provide enhanced findings that are:
1. Medically accurate
2. Properly formatted
3. Using standard radiology terminology
4. Clear and concise`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional radiologist. Enhance clinical findings while maintaining accuracy and using standard medical terminology.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || findings;
    } catch (error) {
      console.error("Findings enhancement error:", error);
      return findings; // Return original if enhancement fails
    }
  }
}

export const groqService = new GroqService();
