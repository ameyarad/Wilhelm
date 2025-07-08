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
    availableTemplates: Array<{ name: string; content: string }>,
  ): Promise<string> {
    try {
      const templateList = availableTemplates.map((t) => t.name).join(", ");

      const messages = [
        {
          role: "system",
          content: `You are a radiology template-selection assistant. Output ONLY valid JSON matching this schema: {\"template\": <string>}. Available templates: ${templateList}`,
        },
        {
          role: "user",
          content: `Select the most appropriate report template:\n${findings}`,
        },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        top_p: 0.6,
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
    availableTemplates: Array<{ name: string; content: string }>,
  ): Promise<ReportGenerationResult> {
    try {
      // Step 1: Select the most appropriate template
      const selectedTemplateName = await this.selectTemplate(
        findings,
        availableTemplates,
      );
      const selectedTemplate =
        availableTemplates.find((t) => t.name === selectedTemplateName) ||
        availableTemplates[0];

      if (!selectedTemplate) {
        throw new Error("No templates available");
      }

      // Step 2: Generate the report using the selected template
      const reportContent = await this.mergeWithTemplate(
        findings,
        selectedTemplate,
      );

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
    template: { name: string; content: string },
  ): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a professional radiology report generation AI assistant. Your task is to merge the dictated text into a radiology report template and generate a complete, well-formatted report.

Guidelines:
- Use the provided template structure as your foundation
- Fill in all relevant sections with information from the clinical findings
- Maintain professional medical language and format
- Include appropriate medical terminology
- Output only the final formatted report, no additional text or explanations`,
        },
        {
          role: "user",
          content: `Example 1:
Template: Chest X-Ray
Template Structure:
EXAMINATION: Chest X-Ray
INDICATION: [indication]
TECHNIQUE: [technique]
FINDINGS: [findings]
IMPRESSION: [impression]

Dictated Findings: PA and lateral chest x-ray shows clear lungs, normal heart size, no pneumothorax

Generated Report:
EXAMINATION: Chest X-Ray
INDICATION: Clinical evaluation
TECHNIQUE: PA and lateral chest radiographs
FINDINGS: The lungs are clear bilaterally without consolidation, effusion, or pneumothorax. Cardiac silhouette is normal in size and configuration. Mediastinal contours are unremarkable.
IMPRESSION: Normal chest radiograph.`
        },
        {
          role: "assistant",
          content: `EXAMINATION: Chest X-Ray
INDICATION: Clinical evaluation
TECHNIQUE: PA and lateral chest radiographs
FINDINGS: The lungs are clear bilaterally without consolidation, effusion, or pneumothorax. Cardiac silhouette is normal in size and configuration. Mediastinal contours are unremarkable.
IMPRESSION: Normal chest radiograph.`
        },
        {
          role: "user",
          content: `Example 2:
Template: CT Head
Template Structure:
EXAMINATION: CT Head without contrast
CLINICAL HISTORY: [history]
TECHNIQUE: [technique]
FINDINGS: [findings]
IMPRESSION: [impression]

Dictated Findings: CT head without contrast shows no acute intracranial abnormality, ventricles normal size

Generated Report:
EXAMINATION: CT Head without contrast
CLINICAL HISTORY: Clinical evaluation
TECHNIQUE: Axial CT images of the head were obtained without intravenous contrast
FINDINGS: No acute intracranial hemorrhage, mass effect, or midline shift. The ventricular system is normal in size and configuration. Gray-white matter differentiation is preserved. No abnormal extra-axial collections.
IMPRESSION: No acute intracranial abnormality.`
        },
        {
          role: "assistant",
          content: `EXAMINATION: CT Head without contrast
CLINICAL HISTORY: Clinical evaluation
TECHNIQUE: Axial CT images of the head were obtained without intravenous contrast
FINDINGS: No acute intracranial hemorrhage, mass effect, or midline shift. The ventricular system is normal in size and configuration. Gray-white matter differentiation is preserved. No abnormal extra-axial collections.
IMPRESSION: No acute intracranial abnormality.`
        },
        {
          role: "user",
          content: `Example 3:
Template: Abdominal Ultrasound
Template Structure:
EXAMINATION: Abdominal Ultrasound
INDICATION: [indication]
FINDINGS:
Liver: [liver findings]
Gallbladder: [gb findings]
Kidneys: [kidney findings]
IMPRESSION: [impression]

Dictated Findings: Liver normal size and echotexture, gallbladder normal, kidneys normal bilaterally

Generated Report:
EXAMINATION: Abdominal Ultrasound
INDICATION: Clinical evaluation
FINDINGS:
Liver: Normal size and echotexture without focal lesions
Gallbladder: Normal wall thickness, no stones or sludge
Kidneys: Normal size and echotexture bilaterally, no hydronephrosis or stones
IMPRESSION: Normal abdominal ultrasound.`
        },
        {
          role: "assistant",
          content: `EXAMINATION: Abdominal Ultrasound
INDICATION: Clinical evaluation
FINDINGS:
Liver: Normal size and echotexture without focal lesions
Gallbladder: Normal wall thickness, no stones or sludge
Kidneys: Normal size and echotexture bilaterally, no hydronephrosis or stones
IMPRESSION: Normal abdominal ultrasound.`
        },
        {
          role: "user",
          content: `Template: ${template.name}

Template Structure:
${template.content}

Dictated Findings:
${findings}

Please generate a complete radiology report by merging the dictated findings into the template structure.`,
        },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        top_p: 0.7,
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

  

  async moderateContent(
    content: string,
  ): Promise<{ isSafe: boolean; violations: string[] }> {
    // Content moderation temporarily disabled due to model decommissioning
    // Always return safe for now
    return { isSafe: true, violations: [] };
  }
}

export const groqService = new GroqService();
