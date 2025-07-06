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
      const transcription = await groq.audio.transcriptions.create({
        file: new File([audioBuffer], "audio.wav", { type: "audio/wav" }),
        model: "whisper-large-v3-turbo",
        response_format: "json",
        language: "en",
      });

      return {
        text: transcription.text,
        confidence: 0.95, // Whisper doesn't provide confidence, using default
      };
    } catch (error) {
      console.error("Transcription error:", error);
      throw new Error("Failed to transcribe audio");
    }
  }

  async generateReport(
    findings: string,
    availableTemplates: Array<{ name: string; content: string; category: string }>
  ): Promise<ReportGenerationResult> {
    try {
      const templateList = availableTemplates
        .map(t => `- ${t.name} (${t.category}): ${t.content.substring(0, 100)}...`)
        .join("\n");

      const prompt = `You are a professional radiologist AI assistant. Based on the following clinical findings, select the most appropriate template and generate a comprehensive radiology report.

Clinical Findings:
${findings}

Available Templates:
${templateList}

Instructions:
1. Analyze the clinical findings
2. Select the most appropriate template from the list
3. Generate a professional radiology report using the selected template
4. Fill in the template with the provided findings
5. Ensure the report follows standard radiology format

Please respond in JSON format with:
{
  "selectedTemplate": "template_name",
  "report": "generated_report_content",
  "reasoning": "brief_explanation_of_template_selection"
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional radiologist AI assistant specializing in medical report generation. Always respond in valid JSON format.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from Groq API");
      }

      const parsedResponse = JSON.parse(response);
      
      return {
        report: parsedResponse.report,
        templateUsed: parsedResponse.selectedTemplate,
        confidence: 0.85,
      };
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
