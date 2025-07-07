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
    <div className="min-h-screen bg-gradient-to-br from-nhs-blue via-nhs-blue to-nhs-light-blue relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/3 rounded-full blur-2xl animate-bounce delay-500"></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full space-y-12">
          {/* Header */}
          <div className={`text-center text-white transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-nhs-accent-blue to-nhs-light-blue rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-3">
                <Activity className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-nhs-light-blue/80 bg-clip-text text-transparent">
                Wilhelm
              </h1>
            </div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              AI-powered radiology reporting platform with advanced transcription and intelligent template management
            </p>
            
            <div className="mb-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-white hover:bg-gray-100 text-nhs-blue px-12 py-6 text-xl font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl group"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-12 py-6 text-xl font-semibold backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-nhs-accent-blue to-nhs-light-blue rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xl">Smart Dictation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed">
                  Advanced voice recognition with Whisper Turbo for accurate medical transcription and real-time processing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-xl">AI Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed">
                  Intelligent report generation using advanced AI models with automatic template selection and clinical accuracy
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xl">Template Library</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-base leading-relaxed">
                  Comprehensive template management with custom uploads, folder organization, and rich text editing capabilities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Section */}
          <div className={`mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Why Choose Wilhelm?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-white/70">Real-time processing and instant report generation</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Secure</h3>
                <p className="text-white/70">HIPAA-compliant with enterprise-grade security</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-white/70">Advanced machine learning for clinical accuracy</p>
              </div>
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Intuitive</h3>
                <p className="text-white/70">User-friendly interface designed for healthcare professionals</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Transform Your Workflow?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join the future of radiology reporting with AI-powered efficiency and clinical precision.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="bg-gradient-to-r from-nhs-accent-blue to-nhs-blue hover:from-nhs-blue hover:to-nhs-dark-blue text-white px-12 py-6 text-xl font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 group"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                  Start Your Journey
                </Button>
              </div>
              <p className="text-white/50 text-sm mt-6">
                Secure authentication • No credit card required • Educational use only
              </p>
            </div>
          </div>
        
          {/* Footer */}
          <footer className="text-center text-white/60 mt-16 pt-8 border-t border-white/10">
            <div className="text-sm">
              <p>© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
              <p className="mt-2 text-xs">
                Built with React, TypeScript, and powered by Groq AI • Hosted on Replit
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
