import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MessageSquare, FileText, Brain, Sparkles, Zap, Shield } from "lucide-react";
import { useState, useEffect } from "react";

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue via-nhs-dark-blue to-nhs-navy relative overflow-hidden frutiger-font">
      {/* Animated background elements with NHS branding */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-nhs-bright-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-nhs-light-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-bounce delay-500"></div>
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-nhs-accent-blue/8 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-nhs-bright-blue/6 rounded-full blur-2xl animate-float delay-2000"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full space-y-12">
          {/* Header */}
          <div className={`text-center text-white transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-white to-nhs-light-blue rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-3 animate-glow">
                <Activity className="w-8 h-8 text-nhs-blue animate-pulse" />
              </div>
              <h1 className="text-6xl frutiger-bold bg-gradient-to-r from-white via-nhs-bright-blue to-white bg-clip-text text-transparent">
                Wilhelm
              </h1>
            </div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed frutiger-font">
              NHS-compliant AI-powered radiology reporting platform with advanced transcription and intelligent template management
            </p>
            
            <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-white hover:bg-nhs-pale-blue text-nhs-blue px-12 py-6 text-xl frutiger-bold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl group animate-glow"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/40 text-white hover:bg-white/15 hover:border-white px-12 py-6 text-xl frutiger-font backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white frutiger-bold">
                  <div className="p-2 bg-gradient-to-r from-nhs-bright-blue to-nhs-accent-blue rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xl">Smart Dictation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed frutiger-font">
                  Advanced voice recognition with Whisper Turbo for accurate medical transcription and real-time processing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white frutiger-bold">
                  <div className="p-2 bg-gradient-to-r from-nhs-light-blue to-nhs-bright-blue rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-xl">AI Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed frutiger-font">
                  Intelligent report generation using advanced AI models with automatic template selection and clinical accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white frutiger-bold">
                  <div className="p-2 bg-gradient-to-r from-nhs-accent-blue to-nhs-light-blue rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xl">Template Library</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed frutiger-font">
                  Comprehensive template management with custom uploads, folder organization, and rich text editing capabilities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Section */}
          <div className={`mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl frutiger-bold text-white text-center mb-8">
              Why Choose Wilhelm?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-nhs-bright-blue to-nhs-light-blue rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl frutiger-bold text-white mb-2">Lightning Fast</h3>
                <p className="text-white/70 frutiger-font">Real-time processing and instant report generation</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-nhs-accent-blue to-nhs-blue rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow delay-200">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl frutiger-bold text-white mb-2">NHS Compliant</h3>
                <p className="text-white/70 frutiger-font">Built following NHS design principles and security standards</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-nhs-dark-blue to-nhs-navy rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow delay-400">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl frutiger-bold text-white mb-2">AI-Powered</h3>
                <p className="text-white/70 frutiger-font">Advanced machine learning for clinical accuracy</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-nhs-light-blue to-nhs-bright-blue rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg animate-glow delay-600">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl frutiger-bold text-white mb-2">Intuitive</h3>
                <p className="text-white/70 frutiger-font">User-friendly interface designed for healthcare professionals</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 animate-glow">
              <h2 className="text-4xl frutiger-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto frutiger-font">
                Join the future of NHS-compliant radiology reporting with AI-powered efficiency and clinical precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="bg-gradient-to-r from-white to-nhs-pale-blue hover:from-nhs-pale-blue hover:to-white text-nhs-blue px-12 py-6 text-xl frutiger-bold shadow-2xl transform transition-all duration-300 hover:scale-105 group animate-glow"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Start Your Journey
                </Button>
              </div>
              <p className="text-white/50 text-sm mt-6 frutiger-font">
                Secure authentication • No credit card required • Educational use only
              </p>
            </div>
          </div>
        
          {/* Footer */}
          <footer className="text-center text-white/60 mt-16 pt-8 border-t border-white/10">
            <div className="text-sm frutiger-font">
              <p>© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
              <p className="mt-2 text-xs">
                Built with React, TypeScript, and powered by Groq AI • Hosted on Replit • Follows NHS Design System
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
