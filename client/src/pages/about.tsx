import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  Mic, 
  FileText, 
  Brain, 
  Eye,
  Clock,
  Shield,
  Globe,
  Heart
} from "lucide-react";

export default function About() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nhs-light-grey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-nhs-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-nhs-dark-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-nhs-light-grey">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nhs-dark-blue mb-2">About Wilhelm</h1>
          <p className="text-nhs-dark-grey/70 text-lg">Free And Open Source Medical Imaging Reporting AI Agent</p>
        </div>

        {/* Core Workflow */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-nhs-blue" />
              <span>Core Workflow</span>
            </CardTitle>
            <p className="text-sm text-nhs-dark-grey/70">
              Wilhelm's workflow is designed for speed and simplicity, centered around a single API call:
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Mic className="w-5 h-5 text-nhs-blue" />
                  <h3 className="font-semibold text-nhs-dark-blue">Dictate or Type</h3>
                </div>
                <p className="text-sm text-nhs-dark-grey/80">
                  User speaks or types into the chat box. Real-time speech is transcribed instantly using Groq's Whisper Automatic Speech Recognition with sub-second latency.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-nhs-blue" />
                  <h3 className="font-semibold text-nhs-dark-blue">Generate Report</h3>
                </div>
                <p className="text-sm text-nhs-dark-grey/80">
                  User clicks "Generate Report," sending the raw text to a single endpoint: <code className="bg-gray-100 px-2 py-1 rounded text-xs">POST /api/v1/reports/generate</code>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-nhs-blue" />
                  <h3 className="font-semibold text-nhs-dark-blue">AI Orchestration</h3>
                </div>
                <p className="text-sm text-nhs-dark-grey/80">
                  The server uses the LLM (Llama 3.18B hosted on Groq) to automatically select the most appropriate report template, then merges the user's text with the chosen template.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-nhs-blue text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-5 h-5 text-nhs-blue" />
                  <h3 className="font-semibold text-nhs-dark-blue">Display Final Report</h3>
                </div>
                <p className="text-sm text-nhs-dark-grey/80">
                  Server returns the final, formatted report, which is displayed to the user for review. The entire process completes in under 3 seconds.
                </p>
              </div>
            </div>

            
          </CardContent>
        </Card>

        {/* About Me */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-nhs-blue" />
              <span>About Me</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-nhs-dark-grey/80 leading-relaxed">
              Wilhelm was created by Ameya Kawthalkar, a passionate developer focused on making AI accessible 
              for healthcare education and research. The platform represents a commitment to open-source healthcare 
              technology and the democratization of medical AI tools.
            </p>
          </CardContent>
        </Card>

        {/* Educational and Research Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-nhs-blue" />
              <span>Educational and Research Use</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
              Wilhelm is designed for educational and research purposes. It is not intended for clinical use, 
              which requires full HIPAA / GDPR / other regulatory compliance.
            </p>
            <div className="bg-nhs-light-blue/10 border border-nhs-light-blue/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-nhs-blue mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-nhs-dark-blue mb-1">
                    HIPAA/GDPR Compliant Version Coming Soon
                  </p>
                  <p className="text-xs text-nhs-dark-grey/80">
                    A fully local, HIPAA and GDPR compliant free and open source version of Wilhelm is currently 
                    under development and will be released soon.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t border-gray-200 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-normal">© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}