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
  // Private context isolation helper to generate fresh session parameters
  private generateFreshContext(userId?: string): {
    sessionId: string;
    seed: number;
    timestamp: string;
  } {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    return {
      sessionId: `${userId || 'anon'}_${timestamp}_${randomId}`,
      seed: Math.floor(Math.random() * 1000000), // Random seed for deterministic but isolated responses
      timestamp: new Date().toISOString(),
    };
  }

  async transcribeAudio(audioBuffer: Buffer, userId?: string): Promise<TranscriptionResult> {
    try {
      // Generate unique filename to ensure complete isolation between calls
      const context = this.generateFreshContext(userId);
      const filename = `audio_${context.sessionId}.webm`;

      console.log("Starting transcription with Groq:", {
        bufferSize: audioBuffer.length,
        filename: filename,
        sessionId: context.sessionId,
        apiKeyPresent: !!process.env.GROQ_API_KEY
      });

      const transcription = await groq.audio.transcriptions.create({
        file: new File([audioBuffer], filename, { type: "audio/webm" }),
        model: "whisper-large-v3-turbo",
        response_format: "json",
        // Remove language parameter to prevent any context carryover
        // Remove any prompt parameter to ensure complete isolation
        temperature: 0.0, // Deterministic output
      });

      console.log("Transcription successful:", {
        textLength: transcription.text.length,
        sessionId: context.sessionId
      });

      return {
        text: transcription.text.trim(), // Trim any whitespace
        confidence: 0.95,
      };
    } catch (error) {
      console.error("Detailed transcription error:", {
        error: error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        apiKeyPresent: !!process.env.GROQ_API_KEY
      });
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async selectTemplate(
    findings: string,
    availableTemplates: Array<{ id: number; name: string; content: string }>,
    userId?: string,
  ): Promise<string> {
    try {
      const context = this.generateFreshContext(userId);
      const templateList = availableTemplates.map((t) => t.name).join(", ");

      const messages = [
        {
          role: "system",
          content: `You are a medical imaging template-selection assistant. This is a completely isolated request with no memory of any previous conversations, users, or templates. You can ONLY select from the templates provided for THIS specific user. Output ONLY valid JSON matching this schema: {\"template\": <string>}. Available templates for user ${userId}: ${templateList}. Session: ${context.sessionId}`,
        },
        {
          role: "user",
          content: `Select the most appropriate report template for these findings:\n${findings}`,
        },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        top_p: 0.6,
        max_tokens: 100,
        // Enhanced context isolation parameters
        seed: context.seed, // Fresh random seed for complete isolation
        user: context.sessionId, // Unique session ID for request isolation
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from AI");
      }

      console.log("Template selection:", {
        sessionId: context.sessionId,
        selectedTemplate: response.substring(0, 50) + "..."
      });

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
    availableTemplates: Array<{ id: number; name: string; content: string }>,
    userId?: string,
  ): Promise<ReportGenerationResult> {
    try {
      // Generate fresh context for complete isolation
      const context = this.generateFreshContext(userId);

      console.log("Starting report generation:", {
        sessionId: context.sessionId,
        templateCount: availableTemplates.length,
        findingsLength: findings.length
      });

      // Step 1: Select the most appropriate template with fresh context
      const selectedTemplateName = await this.selectTemplate(
        findings,
        availableTemplates,
        userId,
      );
      const selectedTemplate =
        availableTemplates.find((t) => t.name === selectedTemplateName) ||
        availableTemplates[0];

      if (!selectedTemplate) {
        throw new Error("No templates available");
      }

      // Step 2: Generate the report using the selected template with fresh context
      const reportContent = await this.mergeWithTemplate(
        findings,
        selectedTemplate,
        userId,
      );

      console.log("Report generation completed:", {
        sessionId: context.sessionId,
        templateUsed: selectedTemplate.name,
        reportLength: reportContent.length
      });

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
    template: { id: number; name: string; content: string },
    userId?: string,
  ): Promise<string> {
    try {
      const context = this.generateFreshContext(userId);
      
      const messages = [
        {
          role: "system",
          content: `You are a professional medical imaging report generation AI assistant. This is an independent request with no connection to previous conversations. Your task is to merge the dictated text into a medical imaging report template and generate a complete, well-formatted report.

Guidelines:
- Use the provided template structure as your foundation
- Fill in all relevant sections with information from the clinical findings
- DELETE or MODIFY any template line that conflicts with the dictation.  
- Example: if template says “Both lungs are normal” but dictation mentions consolidation, replace with  
    “Consolidation in the right lower lobe. The remainder of the lungs are clear.”  
- KEEP template negatives that are not contradicted (e.g. “No pleural effusion”). 
- Maintain professional medical language and format
- Include appropriate medical terminology
- Output only the final formatted report, no additional text or explanations
- Session: ${context.sessionId} | Time: ${context.timestamp}`,
        },
        // Few-shot example (user)
        {
          role: "user",
          name: "example_user",
          content: `
### REPORT TEMPLATE
Patient: Tom Evans
DOB: 1995-08-12
Study: MRI LEFT KNEE (3 T) — 08 Jul 2025
Referrer: Dr Smith, Orthopaedics

**CLINICAL DETAILS:** Pain and instability after football injury.

**TECHNIQUE:** Standard internal-rotation knee protocol.

**FINDINGS:**
{{findings_placeholder}}

**IMPRESSION:**
{{impression_placeholder}}

### DICTATION
- complete tear ACL mid-substance, fibres wavy
- bone bruise lateral femoral condyle + posterior tibial plateau
- intact PCL, MCL, LCL
- small joint effusion
- no meniscal tear
          `.trim(),
        },
        // Few-shot example (assistant)
        {
          role: "assistant",
          name: "example_assistant",
          content: `
### REPORT TEMPLATE
Patient: Tom Evans
DOB: 1995-08-12
Study: MRI LEFT KNEE (3 T) — 08 Jul 2025
Referrer: Dr Smith, Orthopaedics

**CLINICAL DETAILS:** Pain and instability after football injury.

**TECHNIQUE:** Standard internal-rotation knee protocol.

**FINDINGS:**
There is a full-thickness mid-substance rupture of the anterior cruciate ligament with wavy, discontinuous fibres and retraction. Associated bone-marrow oedema involves the lateral femoral condyle and posterior aspect of the lateral tibial plateau, in keeping with contusions. The posterior cruciate, medial collateral and lateral collateral ligaments are intact. The menisci are normal. Articular cartilage and the extensor mechanism are preserved. A small physiological joint effusion is present. No popliteal cyst.

**IMPRESSION:**
Complete ACL rupture with secondary bone contusions; otherwise unremarkable internal derangement.
          `.trim(),
        },
        // Actual user request
        {
          role: "user",
          content: `Template: ${template.name}

Template Structure:
${template.content}

Dictated Findings:
${findings}

Please generate a complete medical imaging report by merging the dictated findings into the template structure.`,
        },
      ];

      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        top_p: 0.7,
        max_tokens: 1000,
        // Enhanced context isolation parameters
        seed: context.seed, // Fresh random seed for complete isolation
        user: context.sessionId, // Unique session ID for request isolation
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from Groq API");
      }

      console.log("Template merge completed:", {
        sessionId: context.sessionId,
        templateName: template.name,
        outputLength: response.length
      });

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
