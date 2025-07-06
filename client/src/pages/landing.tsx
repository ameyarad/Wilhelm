import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, MessageSquare, FileText, Brain } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue to-nhs-light-blue flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-nhs-green rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold">Wilhelm</h1>
          </div>
          <p className="text-xl text-nhs-light-blue/80 max-w-2xl mx-auto">
            AI-powered radiology reporting platform with advanced transcription and template management
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <MessageSquare className="w-5 h-5" />
                <span>Smart Dictation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-nhs-light-blue/80 text-sm">
                Advanced voice recognition with Whisper Turbo for accurate medical transcription
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Brain className="w-5 h-5" />
                <span>AI Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-nhs-light-blue/80 text-sm">
                Intelligent report generation using Llama 3.1 8B with template selection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <FileText className="w-5 h-5" />
                <span>Template Library</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-nhs-light-blue/80 text-sm">
                Comprehensive template management with custom uploads and default library
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-nhs-green hover:bg-nhs-green/90 text-white px-8 py-4 text-lg"
          >
            Get Started
          </Button>
          <p className="text-nhs-light-blue/60 text-sm mt-4">
            Secure authentication powered by Replit
          </p>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-white/80 mt-12 pt-8 border-t border-white/20">
          <div className="text-sm">
            <p className="mb-1">
              © 2025 Ameya Kawthalkar. Wilhelm is a free and open source AI agent for medical imaging reporting.
            </p>
            <p className="text-xs text-white/60">
              For educational and research purposes only. Not for clinical use.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
