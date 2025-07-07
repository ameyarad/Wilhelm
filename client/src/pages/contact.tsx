import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Mail, 
  MessageSquare, 
  Github,
  Globe,
  Heart,
  Coffee
} from "lucide-react";

export default function Contact() {
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
    <div className="flex h-screen bg-nhs-light-grey">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-nhs-dark-blue mb-2 text-center">Contact</h1>
              <p className="text-nhs-dark-grey/70 text-lg text-center">
                Get in touch with the Wilhelm development team
              </p>
            </div>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-6 h-6 text-nhs-blue" />
                    <span>Email</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                    For technical support, feature requests, or general inquiries about Wilhelm.
                  </p>
                  <Button 
                    className="w-full bg-nhs-blue hover:bg-nhs-dark-blue text-white"
                    onClick={() => window.open('mailto:ameya005@gmail.com?subject=Wilhelm%20Inquiry', '_blank')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </CardContent>
              </Card>

              {/* X (Twitter) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-6 h-6 text-nhs-blue" />
                    <span>X (Twitter)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                    Follow for updates, tips, and discussions about AI in radiology.
                  </p>
                  <Button 
                    className="w-full bg-nhs-blue hover:bg-nhs-dark-blue text-white"
                    onClick={() => window.open('https://x.com/ask_msk', '_blank')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Follow @ask_msk
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Open Source */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Github className="w-6 h-6 text-nhs-blue" />
                  <span>Open Source Development</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Wilhelm is free and open source software. Contributions, bug reports, and feature 
                  requests are welcome from the developer community.
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-nhs-dark-grey/80">
                    <strong>Repository:</strong> Coming soon - GitHub repository will be available once the 
                    initial development phase is complete.
                  </p>
                  <p className="text-sm text-nhs-dark-grey/80">
                    <strong>License:</strong> MIT License (Free for educational and research use)
                  </p>
                  <p className="text-sm text-nhs-dark-grey/80">
                    <strong>Contributing:</strong> Documentation for contributors will be available in the repository.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Support the Project */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-6 h-6 text-nhs-blue" />
                  <span>Support the Project</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                  Wilhelm is developed and maintained in my spare time. If you find it useful, 
                  there are several ways to show your support:
                </p>
                <ul className="text-sm text-nhs-dark-grey/80 space-y-2 ml-4 mb-4">
                  <li>• Share Wilhelm with colleagues who might benefit from it</li>
                  <li>• Provide feedback and suggestions for improvement</li>
                  <li>• Report bugs or issues you encounter</li>
                  <li>• Follow the project updates on X</li>
                  <li>• Consider contributing to the codebase once it's open source</li>
                </ul>
                <div className="bg-nhs-light-blue/10 border border-nhs-light-blue/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Coffee className="w-5 h-5 text-nhs-blue mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-nhs-dark-blue mb-1">
                        Buy Me a Coffee
                      </p>
                      <p className="text-xs text-nhs-dark-grey/80">
                        A small donation helps keep the development going and covers hosting costs. 
                        Link will be available soon!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-nhs-blue" />
                  <span>Important Notice</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-nhs-dark-grey/80 leading-relaxed">
                    <strong>Educational Use Only:</strong> Wilhelm is designed for educational and research 
                    purposes. It is not intended for clinical use and should not be used for actual patient 
                    care. Always consult with qualified healthcare professionals for medical decisions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-bold">© 2025 Ameya Kawthalkar. Wilhelm is for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}