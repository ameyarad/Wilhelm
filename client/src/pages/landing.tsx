import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, MessageSquare, FileText, Brain, Sparkles, Zap, Shield } from "lucide-react";
import { useState, useEffect } from "react";
// Using public folder path since the logo is served as static asset

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nhs-dark-blue via-nhs-blue to-nhs-accent-blue relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-nhs-light-blue/30 to-nhs-accent-blue/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-nhs-blue/30 to-nhs-light-blue/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-nhs-accent-blue/20 to-nhs-dark-blue/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-nhs-light-blue/25 to-nhs-blue/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full space-y-12">
          {/* Header */}
          <div className={`text-center text-white transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <img 
                src="/wilhelm-logo.png" 
                alt="Wilhelm - AI Radiology Reporting Platform" 
                className="w-28 h-28 md:w-32 md:h-32 filter drop-shadow-2xl"
                loading="eager"
              />
              
              <h1 className="text-7xl md:text-8xl font-bold text-white">
                Wilhelm
              </h1>
            </div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto mb-12 leading-relaxed font-bold">Free and Open Source Medical Imaging Reporting AI Agent | Transcription To Final Formatted Report In A Second | Upload, Edit and Save Your Report Templates</p>
            
            <div className="mb-16 flex justify-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-white text-nhs-blue px-16 py-8 text-xl font-semibold shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group border-0"
              >
                <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
                Start Reporting
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Card className="bg-gradient-to-br from-nhs-blue/20 to-nhs-dark-blue/20 backdrop-blur-lg border-nhs-light-blue/30 hover:bg-gradient-to-br hover:from-nhs-blue/30 hover:to-nhs-dark-blue/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-3 bg-gradient-to-r from-nhs-accent-blue to-nhs-light-blue rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-semibold text-center">Real-Time Dictation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-base leading-relaxed">Advanced voice recognition for accurate medical transcription and real-time processing</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-nhs-accent-blue/20 to-nhs-blue/20 backdrop-blur-lg border-nhs-light-blue/30 hover:bg-gradient-to-br hover:from-nhs-accent-blue/30 hover:to-nhs-blue/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-3 bg-gradient-to-r from-nhs-dark-blue to-nhs-blue rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-semibold text-center">AI Powered Reporting</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-base leading-relaxed">Instant report generation using artificial intelligence with automatic template selection and report formatting</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-nhs-light-blue/20 to-nhs-accent-blue/20 backdrop-blur-lg border-nhs-light-blue/30 hover:bg-gradient-to-br hover:from-nhs-light-blue/30 hover:to-nhs-accent-blue/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-white">
                  <div className="p-3 bg-gradient-to-r from-nhs-blue to-nhs-accent-blue rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-semibold">Template Library</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-base leading-relaxed text-center">Upload, edit, save and copy your own templates</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Section */}
          <div className={`mt-16 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl font-bold text-white text-center mb-8">Why Wilhelm?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-nhs-accent-blue to-nhs-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
                <p className="text-white/80">Real-time processing and instant report generation</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-nhs-blue to-nhs-dark-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Secure</h3>
                <p className="text-white/80">Enterprise-grade security and encryption</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-nhs-dark-blue to-nhs-light-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Multilingual</h3>
                <p className="text-white/80">Generate reports in 8 languages: English, French, German, Hindi, Italian, Spanish, Portuguese and Thai</p>
              </div>
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-br from-nhs-light-blue to-nhs-accent-blue rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
                  <Activity className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Free and Open Source</h3>
                <p className="text-white/80">Customize Wilhelm as per your needs with code. Connect your own AI models for reporting as per your preference.</p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className={`text-center mt-20 transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gradient-to-br from-nhs-blue/10 to-nhs-dark-blue/10 backdrop-blur-xl border border-nhs-light-blue/20 rounded-3xl p-16 shadow-2xl">
              <h2 className="text-5xl font-bold text-white mb-8 bg-gradient-to-r from-white to-nhs-light-blue/90 bg-clip-text text-transparent">Streamline Your Workflow | Reclaim Your Time</h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">Built By A Radiologist For Radiologists And Other Doctors Practicing Medical Imaging Around The World</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="bg-gradient-to-r from-nhs-accent-blue to-nhs-blue hover:from-nhs-blue hover:to-nhs-dark-blue text-white px-16 py-8 text-xl font-semibold shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group border-0"
                >
                  <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
                  Start Reporting
                </Button>
              </div>
              
            </div>
          </div>
        
          {/* Footer */}
          <footer className="text-center text-white/60 mt-16 pt-8 border-t border-white/10">
            <div className="text-sm">
              <p>© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
              
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
