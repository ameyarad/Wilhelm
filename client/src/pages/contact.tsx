import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  MessageSquare, 
  Github,
  Globe
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
              {/* Feedback Form */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-6 h-6 text-nhs-blue" />
                    <span>Send Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">
                    Share your experience, report bugs, or suggest improvements. Your feedback helps make Wilhelm better.
                  </p>
                  <form 
                    action="https://formspree.io/ameya005@gmail.com" 
                    method="POST" 
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-nhs-dark-grey mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-nhs-dark-grey mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="_replyto"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-nhs-dark-grey mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="_subject"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent"
                        placeholder="Wilhelm Feedback"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-nhs-dark-grey mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-nhs-blue focus:border-transparent resize-none"
                        placeholder="Your feedback, bug report, or feature request..."
                      ></textarea>
                    </div>
                    <input type="hidden" name="_next" value="https://wilhelm-ai.replit.app/contact" />
                    <Button 
                      type="submit"
                      className="w-full bg-nhs-blue hover:bg-nhs-dark-blue text-white"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Feedback
                    </Button>
                  </form>
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
                <p className="text-sm text-nhs-dark-grey/80 leading-relaxed mb-4">Wilhelm is free and open source software. Contributions, bug reports, and feature requests are welcome from the medical community.</p>
                <div className="space-y-3">
                  <p className="text-sm text-nhs-dark-grey/80">
                    <strong>License:</strong> MIT License (Free for educational and research use)
                  </p>
                  <p className="text-sm text-nhs-dark-grey/80">
                    <strong>Contributing:</strong> Documentation for contributors will be available in the repository.
                  </p>
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